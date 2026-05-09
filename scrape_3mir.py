import requests
import json
import time

def pump_data():
    all_programs = []
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://program.gter.net/",
        "Accept": "application/json, text/plain, */*"
    }

    print("🌊 修复版抽水机启动！目标：寄托天下 API 前 5 页...")

    for page in range(1, 6):
        # 加上了你截图里真正带数据的 API 后缀参数
        url = f"https://api.gter.net/v1/program/getList?limit=20&page={page}"
        print(f"⏳ 正在抽取第 {page} 页...")
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                json_data = response.json()
                
                # 核心修复：精准破解双重套娃！
                if 'data' in json_data and 'data' in json_data['data']:
                    # 直接拿第二层盒子里的真实专业列表
                    items = json_data['data']['data'] 
                    all_programs.extend(items)
                    print(f"✅ 第 {page} 页抽取成功，拿到 {len(items)} 条真实专业数据！")
                else:
                    print(f"⚠️ 第 {page} 页没找到真实数据。返回内容: {str(json_data)[:100]}")
            else:
                print(f"❌ 第 {page} 页请求失败，状态码: {response.status_code}")
            
            time.sleep(1.5)
            
        except Exception as e:
            print(f"❌ 发生错误: {e}")

    # 保存文件
    with open("gter_programs_raw.json", "w", encoding="utf-8") as f:
        json.dump(all_programs, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 抽水圆满完成！共抓取到 {len(all_programs)} 条真实专业数据。")
    print("👉 快去看看这次的 gter_programs_raw.json 里面是不是正经的专业信息了！")

if __name__ == "__main__":
    pump_data()