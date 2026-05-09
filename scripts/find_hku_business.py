import json

with open('scripts/batch-update-output/todo-list.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

hku_business = [p for p in data if p['university'] == '香港大学' and ('商' in p['faculty'] or '经济' in p['faculty'])]

print('HKU Business School programs:')
for p in hku_business:
    print(f"  {p['id']} | {p['name_cn']} | {p['name_en']}")
print(f"Total: {len(hku_business)}")
