"""Local Excel comparison. Usage: py compare_excels.py OLD.xlsx NEW.xlsx"""
import argparse
import hashlib
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

MAX_REPORT_ROWS = 200000

def fmt(value):
    if value is None: return ''
    return str(value)[:2000]

def sig(row):
    # Ignore completely empty trailing cells; hash so row content is not repeated in metadata.
    values = [fmt(c.value) for c in row]
    while values and not values[-1]: values.pop()
    return hashlib.sha256(repr(values).encode('utf-8')).hexdigest()

def populated(ws):
    return [tuple(row) for row in ws.iter_rows()] if ws.max_row else []

def main():
    p = argparse.ArgumentParser(description='Compare two XLSX workbooks locally')
    p.add_argument('old'); p.add_argument('new'); p.add_argument('-o','--output',default='excel_comparison.xlsx')
    p.add_argument('--max-diffs',type=int,default=MAX_REPORT_ROWS)
    args=p.parse_args()
    old=load_workbook(args.old,read_only=True,data_only=False)
    new=load_workbook(args.new,read_only=True,data_only=False)
    old_values=load_workbook(args.old,read_only=True,data_only=True)
    new_values=load_workbook(args.new,read_only=True,data_only=True)
    out=Workbook(); overview=out.active; overview.title='Summary'
    changes=out.create_sheet('Cell differences'); rows_report=out.create_sheet('Row changes')
    overview.append(['Sheet','Old rows','New rows','Old columns','New columns','Cell differences','Inserted rows','Deleted rows','Notes'])
    changes.append(['Sheet','Old cell','New cell','Kind','Old value or formula','New value or formula','Old cached result','New cached result'])
    rows_report.append(['Sheet','Kind','Old row','New row','Details'])
    diff_count=0; row_count=0
    for name in sorted(set(old.sheetnames)|set(new.sheetnames)):
        if name not in old.sheetnames:
            w=new[name]; overview.append([name,0,w.max_row,0,w.max_column,0,w.max_row,0,'Added sheet']); continue
        if name not in new.sheetnames:
            w=old[name]; overview.append([name,w.max_row,0,w.max_column,0,0,0,w.max_row,'Removed sheet']); continue
        a,b=old[name],new[name]
        av,bv=old_values[name],new_values[name]
        aa,bb=populated(a),populated(b)
        sa,sb=[sig(r) for r in aa],[sig(r) for r in bb]
        matcher=SequenceMatcher(None,sa,sb,autojunk=False)
        inserted=deleted=sheetdiff=0
        # Compare aligned rows, so an inserted/deleted row doesn't create thousands of false changes.
        for tag,i1,i2,j1,j2 in matcher.get_opcodes():
            if tag=='equal':
                pairs=[(i1+k,j1+k) for k in range(i2-i1)]
            elif tag=='replace':
                pairs=[(i1+k,j1+k) for k in range(min(i2-i1,j2-j1))]
                for i in range(i1+len(pairs),i2):
                    deleted+=1; row_count+=1
                    if row_count<=args.max_diffs: rows_report.append([name,'Deleted / unmatched',i+1,'',''])
                for j in range(j1+len(pairs),j2):
                    inserted+=1; row_count+=1
                    if row_count<=args.max_diffs: rows_report.append([name,'Inserted / unmatched','',j+1,''])
            else:
                pairs=[]
                if tag=='delete':
                    for i in range(i1,i2):
                        deleted+=1; row_count+=1
                        if row_count<=args.max_diffs: rows_report.append([name,'Deleted',i+1,'',''])
                if tag=='insert':
                    for j in range(j1,j2):
                        inserted+=1; row_count+=1
                        if row_count<=args.max_diffs: rows_report.append([name,'Inserted','',j+1,''])
            for i,j in pairs:
                if sa[i]==sb[j]: continue
                ra,rb=aa[i],bb[j]
                for col in range(max(len(ra),len(rb))):
                    ca=ra[col] if col<len(ra) else None
                    cb=rb[col] if col<len(rb) else None
                    va=ca.value if ca else None; vb=cb.value if cb else None
                    if va==vb: continue
                    sheetdiff+=1; diff_count+=1
                    if diff_count>args.max_diffs: continue
                    typ='Formula changed' if (isinstance(va,str) and va.startswith('=') or isinstance(vb,str) and vb.startswith('=')) else 'Value changed'
                    if '#REF!' in fmt(va)+fmt(vb): typ='Broken reference / #REF!'
                    x=get_column_letter(col+1)
                    cached_a=av.cell(i+1,col+1).value if isinstance(va,str) and va.startswith('=') else ''
                    cached_b=bv.cell(j+1,col+1).value if isinstance(vb,str) and vb.startswith('=') else ''
                    changes.append([name,f'{x}{i+1}',f'{x}{j+1}',typ,fmt(va),fmt(vb),fmt(cached_a),fmt(cached_b)])
        overview.append([name,a.max_row,b.max_row,a.max_column,b.max_column,sheetdiff,inserted,deleted,''])
        print(f'{name}: {sheetdiff} changed cells; {inserted} inserted / {deleted} deleted rows')
    # Also catch cached formula result changes where formula text is identical at the same address.
    cache=out.create_sheet('Cached formula changes')
    cache.append(['Sheet','Cell','Formula','Old cached result','New cached result'])
    cached_count=0
    for name in sorted(set(old.sheetnames)&set(new.sheetnames)):
        a,b=old[name],new[name]; av,bv=old_values[name],new_values[name]
        for row in a.iter_rows():
            for c in row:
                if c.data_type!='f': continue
                if c.row > b.max_row or c.column > b.max_column: continue
                other=b[c.coordinate]
                if other.value!=c.value: continue
                x,y=av[c.coordinate].value,bv[c.coordinate].value
                if x!=y:
                    cached_count+=1
                    if cached_count<=args.max_diffs: cache.append([name,c.coordinate,fmt(c.value),fmt(x),fmt(y)])
    for ws in out:
        ws.freeze_panes='A2'; ws.auto_filter.ref=ws.dimensions
        for c in ws[1]: c.font=Font(color='FFFFFF',bold=True); c.fill=PatternFill('solid',fgColor='17365D')
        for column in ws.columns:
            letter=column[0].column_letter
            width=min(65,max(14,max(len(str(cell.value or '')) for cell in list(column)[:300])+2))
            ws.column_dimensions[letter].width=width
    out.save(args.output)
    print(f'\nSaved: {Path(args.output).resolve()}')
    print(f'Changed cells: {diff_count}; row events: {row_count}; cached formula differences: {cached_count}')
    if diff_count>args.max_diffs or row_count>args.max_diffs or cached_count>args.max_diffs:
        print('WARNING: Report rows capped. Increase --max-diffs if needed.')
    print('All processing was local. No files uploaded.')

if __name__=='__main__': main()
