import json

with open('scripts/batch-update-output/todo-list.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find HKU programs and their faculties
hku_programs = [p for p in data if p['university'] == '香港大学']

# Count by faculty
faculties = {}
for p in hku_programs:
    f = p['faculty']
    faculties[f] = faculties.get(f, 0) + 1

print('HKU faculties:')
for f, count in sorted(faculties.items(), key=lambda x: -x[1]):
    print(f"  {f}: {count}")
print(f"\nTotal HKU programs: {len(hku_programs)}")
