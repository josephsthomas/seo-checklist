#!/usr/bin/env python3
"""Merge partial JSON defect files into a single Excel report."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from write_defects import write_role_report

role_num = int(sys.argv[1])
role_name = sys.argv[2]
output_path = sys.argv[3]
parts_pattern = sys.argv[4]  # e.g., "role_01_part"

qa_dir = os.path.dirname(os.path.abspath(__file__))
all_defects = []
for suffix in ['a', 'b', 'c']:
    part_file = os.path.join(qa_dir, f"{parts_pattern}_{suffix}.json")
    if os.path.exists(part_file):
        with open(part_file) as f:
            data = json.load(f)
            if isinstance(data, list):
                all_defects.extend(data)
        print(f"  Loaded {len(data)} defects from {part_file}")
    else:
        print(f"  WARNING: {part_file} not found")

# Re-number bug IDs sequentially
for i, d in enumerate(all_defects, 1):
    d["bug_id"] = f"R{role_num:02d}-{i:03d}"

count = write_role_report(role_num, role_name, all_defects, output_path)
print(f"MERGED: {count} total defects for {role_name}")
