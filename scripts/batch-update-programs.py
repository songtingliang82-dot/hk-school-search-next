#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新专业详情页数据
从各大学官网搜索准确信息并更新 programs.ts

使用方法:
1. 解析当前数据文件，找出需要更新的专业
2. 为每个专业生成搜索查询
3. 输出待更新清单，供人工或AI批量处理
4. 支持增量更新（只更新模板化/空白的字段）
"""

import json
import re
import os
import sys
from pathlib import Path
from urllib.parse import quote

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
DATA_FILE = PROJECT_ROOT / "src" / "data" / "programs.ts"
OUTPUT_DIR = PROJECT_ROOT / "scripts" / "batch-update-output"

# 模板化内容标记（需要更新的内容）
TEMPLATE_DESCRIPTIONS = [
    "该专业面向希望拓展香港高校学习与职业发展机会的申请者，课程信息请以院校官网最新公布为准。",
    "课程设置、选修方向及毕业要求请参考项目官方网站的最新说明。",
]

TEMPLATE_REQUIREMENTS = {
    "language": "通常要求雅思 6.0 或 托福 80",
    "standardized": "部分热门专业建议提交 GMAT/GRE",
    "others": "需提供PS、CV及两封推荐信",
    "timeline": "入学时间：2026",
}

# 香港各大学官网搜索URL模板
UNIVERSITY_SEARCH_URLS = {
    "香港大学": "https://www.hku.hk",
    "香港中文大学": "https://www.cuhk.edu.hk",
    "香港科技大学": "https://www.ust.hk",
    "香港城市大学": "https://www.cityu.edu.hk",
    "香港理工大学": "https://www.polyu.edu.hk",
    "香港浸会大学": "https://www.hkbu.edu.hk",
    "香港教育大学": "https://www.eduhk.hk",
    "岭南大学": "https://www.ln.edu.hk",
    "香港都会大学": "https://www.hkmu.edu.hk",
    "香港恒生大学": "https://www.hsu.edu.hk",
    "香港珠海学院": "https://www.chuhai.edu.hk",
    "香港树仁大学": "https://www.hksyu.edu",
    "香港演艺学院": "https://www.hkapa.edu",
}


def parse_programs():
    """解析 programs.ts 文件，提取所有专业数据"""
    content = DATA_FILE.read_text(encoding="utf-8")

    # 提取 export const programs = [...] 中的数组内容
    match = re.search(r"export\s+const\s+programs\s*=\s*(\[.*?\]);", content, re.DOTALL)
    if not match:
        print("无法解析 programs.ts 文件")
        return []

    json_str = match.group(1)
    # 将单引号转为双引号，将没有引号的key加上引号
    # 这是一个简化的解析，实际可能需要更 robust 的处理
    try:
        programs = json.loads(json_str)
        return programs
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        # 尝试使用更宽松的方式
        return parse_programs_loose(content)


def parse_programs_loose(content):
    """宽松解析，按对象分割"""
    # 找到数组开始和结束
    start = content.find("[")
    end = content.rfind("]")
    if start == -1 or end == -1:
        return []

    array_content = content[start + 1:end]

    # 按顶层对象分割
    programs = []
    depth = 0
    obj_start = 0
    in_string = False
    escape = False

    for i, char in enumerate(array_content):
        if escape:
            escape = False
            continue
        if char == "\\":
            escape = True
            continue
        if char in '"\'':
            in_string = not in_string
            continue
        if in_string:
            continue

        if char == "{":
            if depth == 0:
                obj_start = i
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                obj_str = array_content[obj_start:i + 1]
                try:
                    # 将单引号替换为双引号
                    obj_str = obj_str.replace("'", '"')
                    # 处理没有引号的key
                    obj_str = re.sub(r"([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:", r'\1"\2":', obj_str)
                    program = json.loads(obj_str)
                    programs.append(program)
                except json.JSONDecodeError:
                    pass

    return programs


def is_template_description(desc):
    """检查描述是否为模板化内容"""
    if not desc:
        return True
    for template in TEMPLATE_DESCRIPTIONS:
        if template in desc:
            return True
    return False


def is_template_requirements(reqs):
    """检查要求是否为模板化内容"""
    if not reqs:
        return True
    for key, template in TEMPLATE_REQUIREMENTS.items():
        if key in reqs and template in reqs[key]:
            return True
    return False


def generate_search_query(program):
    """为专业生成搜索查询"""
    university = program.get("university", "")
    name_cn = program.get("name_cn", "")
    name_en = program.get("name_en", "")
    faculty = program.get("faculty", "")

    queries = []

    # 中文搜索查询
    if name_cn and university:
        queries.append(f"{university} {name_cn} 入学要求 课程 学费 2026")
        queries.append(f"{university} {name_cn} 申请")

    # 英文搜索查询
    if name_en and university:
        uni_en = university.replace("香港", "Hong Kong ").replace("大学", "University")
        queries.append(f"{uni_en} {name_en} admission requirements curriculum 2026")

    return queries


def generate_university_program_url(program):
    """尝试生成大学官网的专业页面URL"""
    university = program.get("university", "")
    official = program.get("official_website", "")
    name_en = program.get("name_en", "")

    if official and official != "":
        return official

    base_url = UNIVERSITY_SEARCH_URLS.get(university, "")
    if not base_url:
        return ""

    # 尝试构造搜索URL
    if name_en:
        search_term = quote(name_en)
        return f"{base_url}/search?q={search_term}"

    return base_url


def analyze_programs(programs):
    """分析所有专业，找出需要更新的"""
    needs_update = []
    up_to_date = []

    for program in programs:
        desc = program.get("desc", "")
        reqs = program.get("requirements", {})
        curr = program.get("curriculum", "")
        official = program.get("official_website", "")

        needs_desc_update = is_template_description(desc)
        needs_req_update = is_template_requirements(reqs)
        needs_curr_update = is_template_description(curr)
        has_official_url = official and official != ""

        if needs_desc_update or needs_req_update or needs_curr_update:
            needs_update.append({
                "id": program.get("id", ""),
                "name_cn": program.get("name_cn", ""),
                "name_en": program.get("name_en", ""),
                "university": program.get("university", ""),
                "faculty": program.get("faculty", ""),
                "needs_desc": needs_desc_update,
                "needs_req": needs_req_update,
                "needs_curr": needs_curr_update,
                "has_official_url": has_official_url,
                "official_website": official,
                "search_queries": generate_search_query(program),
                "suggested_url": generate_university_program_url(program),
            })
        else:
            up_to_date.append(program.get("id", ""))

    return needs_update, up_to_date


def generate_batch_files(needs_update, up_to_date_count=0):
    """生成批量处理文件"""
    OUTPUT_DIR.mkdir(exist_ok=True)

    # 按大学分组
    by_university = {}
    for item in needs_update:
        uni = item["university"]
        if uni not in by_university:
            by_university[uni] = []
        by_university[uni].append(item)

    # 生成总览报告
    total = len(needs_update) + up_to_date_count
    report_lines = [
        "# 专业详情页更新报告",
        "",
        f"**总计专业数**: {total}",
        f"**需要更新**: {len(needs_update)}",
        f"**已较完整**: {up_to_date_count}",
        "",
        "## 按大学分布（需要更新的专业）",
        "",
    ]

    for uni in sorted(by_university.keys()):
        items = by_university[uni]
        report_lines.append(f"- **{uni}**: {len(items)} 个")

    report_lines.extend([
        "",
        "## 处理优先级建议",
        "",
        "1. **高优先级**: 有 official_website 的专业（可直接抓取）",
        "2. **中优先级**: 热门专业（商科、计算机、金融、工程等）",
        "3. **低优先级**: 使用通用模板描述的专业",
        "",
    ])

    report_path = OUTPUT_DIR / "update-report.md"
    report_path.write_text("\n".join(report_lines), encoding="utf-8")
    print(f"报告已生成: {report_path}")

    # 生成按大学的批处理文件
    for uni, items in by_university.items():
        # 只生成前20个作为示例
        batch_lines = [
            f"# {uni} - 待更新专业列表",
            f"",
            f"**共 {len(items)} 个专业需要更新**",
            f"",
        ]

        for item in items[:50]:  # 每所大学最多50个
            batch_lines.extend([
                f"## {item['name_cn']} ({item['name_en']})",
                f"- ID: `{item['id']}`",
                f"- 学院: {item['faculty']}",
                f"- 需要更新描述: {'是' if item['needs_desc'] else '否'}",
                f"- 需要更新要求: {'是' if item['needs_req'] else '否'}",
                f"- 需要更新课程: {'是' if item['needs_curr'] else '否'}",
                f"- 官网: {item['official_website'] or item['suggested_url'] or '无'}",
                f"- 搜索查询:",
            ])
            for q in item['search_queries']:
                batch_lines.append(f"  - {q}")
            batch_lines.append("")

        # 安全文件名
        safe_name = re.sub(r'[\\/:*?"<>|]', '_', uni)
        batch_path = OUTPUT_DIR / f"{safe_name}.md"
        batch_path.write_text("\n".join(batch_lines), encoding="utf-8")
        print(f"批处理文件已生成: {batch_path} ({len(items)} 个专业)")

    # 生成 JSON 格式的待处理清单（供脚本自动处理）
    todo_list = []
    for item in needs_update:
        todo_list.append({
            "id": item["id"],
            "name_cn": item["name_cn"],
            "name_en": item["name_en"],
            "university": item["university"],
            "faculty": item["faculty"],
            "official_website": item["official_website"] or item["suggested_url"],
            "search_queries": item["search_queries"],
            "update_fields": {
                "desc": item["needs_desc"],
                "requirements": item["needs_req"],
                "curriculum": item["needs_curr"],
            },
        })

    todo_path = OUTPUT_DIR / "todo-list.json"
    todo_path.write_text(json.dumps(todo_list, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"待处理清单已生成: {todo_path}")

    return by_university


def main():
    print("=" * 60)
    print("批量更新专业详情页数据")
    print("=" * 60)
    print()

    # 1. 解析数据文件
    print("Step 1: 解析 programs.ts ...")
    programs = parse_programs()
    print(f"  共解析到 {len(programs)} 个专业")
    print()

    if not programs:
        print("错误: 未能解析到任何专业数据")
        sys.exit(1)

    # 2. 分析需要更新的专业
    print("Step 2: 分析需要更新的专业 ...")
    needs_update, up_to_date = analyze_programs(programs)
    print(f"  需要更新: {len(needs_update)} 个")
    print(f"  已较完整: {len(up_to_date)} 个")
    print()

    # 3. 生成批量处理文件
    print("Step 3: 生成批量处理文件 ...")
    by_university = generate_batch_files(needs_update, len(up_to_date))
    print()

    # 4. 统计
    print("=" * 60)
    print("统计摘要")
    print("=" * 60)
    print(f"输出目录: {OUTPUT_DIR}")
    print()
    print("生成文件:")
    print(f"  1. update-report.md - 总览报告")
    print(f"  2. [大学名].md - 各大学待更新专业列表（共 {len(by_university)} 个文件）")
    print(f"  3. todo-list.json - 机器可读待处理清单")
    print()
    print("使用建议:")
    print("  - 查看 update-report.md 了解整体情况")
    print("  - 按大学逐个处理，优先处理有官网链接的专业")
    print("  - 使用 todo-list.json 配合自动化脚本批量处理")
    print()


if __name__ == "__main__":
    main()
