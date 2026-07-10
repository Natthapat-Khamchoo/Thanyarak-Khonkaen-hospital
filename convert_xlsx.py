import pandas as pd
import json
import os
import glob

def clean_date(val):
    if pd.isna(val):
        return None
    try:
        return pd.to_datetime(val).strftime('%Y-%m-%d')
    except:
        return None

def mask_thai_name(fullname):
    if pd.isna(fullname):
        return 'ไม่ระบุ'
    fullname = str(fullname).strip()
    if not fullname:
        return 'ไม่ระบุ'
    parts = fullname.split()
    if len(parts) >= 2:
        # First name + first char of last name
        return f"{parts[0]} {parts[1][0]}."
    else:
        return f"{fullname[:2]}***"

def convert_excel_to_json():
    # Target columns map (with name column mapped for privacy-first extraction)
    columns_mapping = {
        'an': 'an',
        'hn': 'hn',
        'ชื่อ_สกุล': 'name',
        'จังหวัด': 'province',
        'เขตสุขภาพ': 'healthZone',
        'วันที่จำหน่าย': 'dischargeDate',
        'วันนอน': 'lengthOfStay',
        'โรคหลัก': 'primaryDiagnosis',
        'กลุ่มโรค': 'diseaseGroup',
        'วันที่มาติดตามครั้งแรก': 'followUpDate',
        'สถานะติดตาม': 'status'
    }
    
    # We will support multiple spelling configurations of some columns
    alt_mappings = {
        'จำนวนวันหลังจำหน่ายแล้วมาติดตามครั้งแรก': 'daysToFollowUp',
        'จำนวนวันหลังจำหน่ายแล้วมาติดตาม': 'daysToFollowUp'
    }

    # Ensure output directory exists
    os.makedirs(os.path.join('src', 'data'), exist_ok=True)
    
    result = {}
    
    # Years of interest
    years = ['2567', '2568', '2569']
    
    for year in years:
        # Locate file
        pattern = f"*{year}*.xlsx"
        files = glob.glob(pattern)
        if not files:
            print(f"Warning: No excel file matching {pattern} found.")
            continue
        
        file_path = files[0]
        print(f"Processing local file: {file_path} for year {year}...")
        
        try:
            xls = pd.ExcelFile(file_path)
            # Find the main data sheet (contains the list of cases, which is usually the one with 'จำหน่าย' or 'AN' in the name)
            data_sheet = None
            for s in xls.sheet_names:
                if 'จำหน่าย' in s or 'ราย' in s or 'AN' in s:
                    data_sheet = s
                    break
            
            if not data_sheet:
                # fallback to first sheet
                data_sheet = xls.sheet_names[0]
                
            print(f"  Reading data sheet: '{data_sheet}'")
            df = pd.read_excel(file_path, sheet_name=data_sheet)
            
            # Map columns
            mapped_cols = {}
            for col in df.columns:
                col_stripped = str(col).strip()
                if col_stripped in columns_mapping:
                    mapped_cols[col] = columns_mapping[col_stripped]
                elif col_stripped in alt_mappings:
                    mapped_cols[col] = alt_mappings[col_stripped]
            
            # Rename and keep mapped columns
            df_subset = df[list(mapped_cols.keys())].rename(columns=mapped_cols)
            
            # Clean values
            df_subset['an'] = df_subset['an'].apply(lambda x: str(int(x)) if pd.notna(x) and isinstance(x, (int, float)) else str(x))
            df_subset['hn'] = df_subset['hn'].apply(lambda x: str(int(x)) if pd.notna(x) and isinstance(x, (int, float)) else str(x))
            
            if 'lengthOfStay' in df_subset.columns:
                df_subset['lengthOfStay'] = pd.to_numeric(df_subset['lengthOfStay'], errors='coerce').fillna(0).astype(int)
            else:
                df_subset['lengthOfStay'] = 0
                
            df_subset['dischargeDate'] = df_subset['dischargeDate'].apply(clean_date)
            df_subset['followUpDate'] = df_subset['followUpDate'].apply(clean_date)
            
            # Mask names for privacy compliance
            if 'name' in df_subset.columns:
                df_subset['name'] = df_subset['name'].apply(mask_thai_name)
            else:
                df_subset['name'] = 'ไม่ระบุ'
            
            # Fill missing text fields
            text_fields = ['province', 'healthZone', 'primaryDiagnosis', 'diseaseGroup', 'status']
            for field in text_fields:
                if field in df_subset.columns:
                    df_subset[field] = df_subset[field].fillna("").astype(str).str.strip()
                else:
                    df_subset[field] = ""
                    
            # Convert to list of dicts and clean any NaN/NaT values
            records = []
            for r in df_subset.to_dict(orient='records'):
                cleaned_r = {}
                for k, v in r.items():
                    # Handle NaN, NaT, and infinite values
                    if pd.isna(v) or (isinstance(v, float) and (v != v or v == float('inf') or v == float('-inf'))):
                        cleaned_r[k] = None
                    else:
                        cleaned_r[k] = v
                records.append(cleaned_r)
                
            result[year] = records
            print(f"  Successfully loaded {len(records)} records for year {year}")
            
        except Exception as e:
            print(f"  Error reading {file_path}: {e}")
            
    # Write JSON output
    output_json = os.path.join('src', 'data', 'fallback-data.json')
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
        
    print(f"\nSaved combined data to {output_json} (keys: {list(result.keys())})")

if __name__ == '__main__':
    convert_excel_to_json()
