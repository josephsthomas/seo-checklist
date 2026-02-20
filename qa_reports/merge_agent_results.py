import json, sys, glob, re

def extract_json_array(text):
    """Extract JSON array from agent output, handling various formats."""
    text = text.strip()
    try:
        data = json.loads(text)
        if isinstance(data, list):
            return data
    except (json.JSONDecodeError, ValueError):
        pass
    match = re.search(r'```(?:json)?\s*(\[[\s\S]*?\])\s*```', text)
    if match:
        try:
            return json.loads(match.group(1))
        except (json.JSONDecodeError, ValueError):
            pass
    start = text.find('[')
    end = text.rfind(']')
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end+1])
        except (json.JSONDecodeError, ValueError):
            pass
    print(f"ERROR: Could not parse JSON from text ({len(text)} chars)")
    return []

def merge_role(role_num, existing_json=None):
    """Merge all agent results for a role, optionally with existing defects."""
    pattern = f"qa_reports/role_{role_num:02d}_agent_*.json"
    files = sorted(glob.glob(pattern))
    all_defects = []

    # Load existing defects if provided
    if existing_json and existing_json != "none":
        try:
            with open(existing_json) as fh:
                existing = json.load(fh) if existing_json.endswith('.json') else extract_json_array(fh.read())
                all_defects.extend(existing)
                print(f"Loaded {len(existing)} existing defects from {existing_json}")
        except Exception as e:
            print(f"Warning: Could not load existing: {e}")

    # Load agent results
    for f in files:
        try:
            with open(f) as fh:
                content = fh.read()
                defects = extract_json_array(content) if not content.strip().startswith('[') else json.loads(content)
                if not isinstance(defects, list):
                    defects = extract_json_array(content)
                all_defects.extend(defects)
                print(f"Loaded {len(defects)} defects from {f}")
        except Exception as e:
            print(f"Warning: Could not load {f}: {e}")

    # Re-number bug IDs sequentially
    prefix = f"R{role_num:02d}"
    for i, d in enumerate(all_defects, 1):
        d["bug_id"] = f"{prefix}-{i:03d}"

    output = f"qa_reports/role_{role_num:02d}_defects.json"
    with open(output, "w") as fh:
        json.dump(all_defects, fh, indent=2)
    print(f"Merged {len(all_defects)} defects from {len(files)} agents -> {output}")
    return len(all_defects)

if __name__ == "__main__":
    role = sys.argv[1]  # e.g., "01"
    existing = sys.argv[2] if len(sys.argv) > 2 else None
    count = merge_role(int(role), existing)
    print(f"TOTAL: {count} defects")
