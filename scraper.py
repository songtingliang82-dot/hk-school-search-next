import requests
from bs4 import BeautifulSoup
import json
import time
import os

def start_scraping():
    target_url = "https://www.schooland.hk/ps/kowloon-city"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    }

    print(f"📡 正在连接目标网站: {target_url}")
    
    try:
        response = requests.get(target_url, headers=headers)
        response.encoding = 'utf-8'
        print(f"🔍 网站连接状态码: {response.status_code} (如果是200说明没被拦截)")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 换一张更大的“网”：直接找网页里所有的表格行 <tr> 或者是含有链接的区块
        schools = soup.find_all('tr') 
        
        results = []
        for row in schools:
            # 在每一行里找带链接的文字（通常学校名都是可以点击的）
            name_tag = row.find('a')
            if not name_tag:
                continue
                
            name = name_tag.text.strip()
            # 过滤掉无关的按钮，只保留名字长度大于3且像学校的名字
            if len(name) > 3 and ("小学" in name or "学校" in name or "书院" in name):
                school_item = {
                    "id": f"hk-ps-{int(time.time() * 1000)}-{len(results)}",
                    "stage": "小学",
                    "schoolName": name,
                    "faculty": "九龙城", 
                    "majorCategory": "本地课程",
                    "specificMajor": "全日制",
                    "programName": name,
                    "tuition": "待补充",
                    "languageRequirement": "两文三语",
                    "gpaRequirement": "根据教育局派位",
                    "duration": "6年",
                    "tags": ["九龙城区"],
                    "deadline": "9月-11月"
                }
                # 避免重复添加相同的学校
                if not any(s['schoolName'] == name for s in results):
                    results.append(school_item)
                    print(f"✅ 成功捕获: {name}")
            
        if len(results) == 0:
            print("\n⚠️ 还是 0 个！我们可能被网站的防爬虫系统拦住了。")
            print("--- 下面是网站返回给我们的真实内容前500个字 ---")
            print(response.text[:500])
            print("--------------------------------------------------")
        else:
            output_path = os.path.join('src', 'data', 'schools.json')
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f"\n🎉 大功告成！共抓取 {len(results)} 所学校。请去运行 node makeNotes.js 吧！")

    except Exception as e:
        print(f"❌ 抓取出错: {e}")

if __name__ == "__main__":
    start_scraping()