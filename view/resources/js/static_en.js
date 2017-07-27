var locationMainArray = {
	code: ["00",
	       "01",
	       "02",
	       "03",
	       "04",
	       "05",
	       "06",
	       "07",
	       "08",
	       "09",
	       "10",
	       "11",
	       "12",
	       "13",
	       "14",
	       "15"],
	value: [
	        "서울",
	        "부산",
	        "대구",
	        "인천",
	        "광주",
	        "대전",
	        "울산",
	        "경기",
	        "강원",
	        "충북",
	        "충남",
	        "전북",
	        "전남",
	        "경북",
	        "경남",
	        "제주"]
};
var locationMain = {
	"": "알수없음",
	"00": "서울",
	"01": "부산",
	"02": "대구",
	"03": "인천",
	"04": "광주",
	"05": "대전",
	"06": "울산",
	"07": "경기",
	"08": "강원",
	"09": "충북",
	"10": "충남",
	"11": "전북",
	"12": "전남",
	"13": "경북",
	"14": "경남",
	"15": "제주"
};
var locationSub = {
	"00": {
		"0000":"강남구",
		"0001":"강동구",
		"0002":"강북구",
		"0003":"강서구",
		"0004":"관악구",
		"0005":"광진구",
		"0006":"구로구",
		"0007":"금천구",
		"0008":"노원구",
		"0009":"도봉구",
		"0010":"동대문구",
		"0011":"동작구",
		"0012":"마포구",
		"0013":"서대문구",
		"0014":"서초구",
		"0015":"성동구",
		"0016":"성북구",
		"0017":"송파구",
		"0018":"양천구",
		"0019":"영등포구",
		"0021":"용산구",
		"0022":"은평구",
		"0023":"종로구",
		"0024":"중구",
		"0025":"중랑구"	
	},
	"01": {
		"0100": "강서구",
		"0101": "금정구",
		"0102": "남구",
		"0103": "동래구",
		"0104": "부산진구",
		"0105": "북구",
		"0106": "사상구",
		"0107": "사하구",
		"0108": "서구",
		"0109": "수영구",
		"0110": "연제구",
		"0111": "영도구",
		"0112": "중구",
		"0113": "해운대구"
	},
	"02": {
		"0200": "남구",
		"0201": "달서구",
		"0202": "달성구",
		"0203": "동구",
		"0204": "북구",
		"0205": "서구",
		"0206": "수성구",
		"0207": "중구"
	},
	"03": {
		"0300": "강화구",
		"0301": "계양구",
		"0302": "남구",
		"0303": "남동구",
		"0304": "동구",
		"0305": "부평구",
		"0306": "서구",
		"0307": "연수구"
	},
	"04": {
		"0400": "광산구",
		"0401": "남구",
		"0402": "동구",
		"0403": "북구",
		"0404": "서구"
	},
	"05":{
		"0500": "대덕구",
		"0501": "동구",
		"0502": "서구",
		"0503": "유성구",
		"0504": "중구"
	},
	"06":{
		"0600": "남구",
		"0601": "동구",
		"0602": "북구",
		"0603": "울주군",
		"0604": "중구"
	},
	"07":{
		"0700": "가평군",
		"0701": "고양시 덕양구",
		"0702": "고양시 일산동구",
		"0703": "고양시 일산서구",
		"0704": "과천시",
		"0705": "광명시",
		"0706": "광주시",
		"0707": "구리시",
		"0708": "군포시",
		"0709": "김포시",
		"0710": "남양주시",
		"0711": "동두천시",
		"0712": "부천시 소사구",
		"0713": "부천시 오정구",
		"0714": "부천시 원미구",
		"0715": "성남시 분당구",
		"0716": "성남시 수정구",
		"0717": "성남시 중원구",
		"0718": "수원시 권선구",
		"0719": "수원시 영통구",
		"0720": "수원시 장안구",
		"0721": "수원시 팔달구",
		"0722": "시흥시",
		"0723": "안산시 단원구",
		"0724": "안산시 상록구",
		"0725": "안성시",
		"0726": "안양시 동안구",
		"0727": "안양시 만안구",
		"0728": "양주시",
		"0729": "양평군",
		"0730": "여주군",
		"0731": "연천군",
		"0732": "오산시",
		"0733": "용인시 기흥구",
		"0734": "용인시 수지구",
		"0735": "용인시 처인구",
		"0736": "의왕시",
		"0737": "의정부시",
		"0738": "이천시",
		"0739": "파주시",
		"0740": "평택시",
		"0741": "포천시",
		"0742": "하남시",
		"0743": "화성시"
	},
	"08": {
		"0800": "강릉시",
		"0801": "고성군",
		"0802": "동해시",
		"0803": "삼청시",
		"0804": "속초시",
		"0805": "양구군",
		"0806": "양양군",
		"0807": "영월군",
		"0808": "원주시",
		"0809": "인제군",
		"0810": "정선군",
		"0811": "철원군",
		"0812": "춘천시",
		"0813": "태백시",
		"0814": "평창군",
		"0815": "홍천군",
		"0816": "화찬군",
		"0817": "횡성군"
	},
	"09":{
		"0900": "괴산군",
		"0901": "단양군",
		"0902": "보은군",
		"0903": "영동군",
		"0904": "옥천군",
		"0905": "음성군",
		"0906": "제천시",
		"0907": "증평군",
		"0908": "진천군",
		"0909": "청원군",
		"0910": "청주시 상당구",
		"0911": "청주시 흥덕구",
		"0912": "충주시"
	},
	"10": {
		"1000": "계룡시",
		"1001": "공주시",
		"1002": "금산군",
		"1003": "논산시",
		"1004": "당진시",
		"1005": "보령시",
		"1006": "부여군",
		"1007": "서산시",
		"1008": "서천군",
		"1009": "아산시",
		"1010": "연기군",
		"1011": "예산군",
		"1012": "천안시 동남구",
		"1013": "천안시 서북구",
		"1014": "청양군",
		"1015": "태안군",
		"1016": "홍성군"
	},
	"11": {
		"1100": "고창군",
		"1101": "군산시",
		"1102": "김제시",
		"1103": "남원시",
		"1104": "무주군",
		"1105": "순창군",
		"1106": "완주군",
		"1107": "익산시",
		"1108": "임실군",
		"1109": "장수군",
		"1110": "전주시 덕진구",
		"1111": "전주시 완산구",
		"1112": "정읍시",
		"1113": "진안군"
	}, 
	"12": {
		"1200": "강진군",
		"1201": "고흥군",
		"1202": "곡성군",
		"1203": "광양시",
		"1204": "구례군",
		"1205": "나주시",
		"1206": "담양군",
		"1207": "목포시",
		"1208": "무안군",
		"1209": "보성군",
		"1210": "순천시",
		"1211": "신안군",
		"1212": "여수시",
		"1213": "영광군",
		"1214": "영암군",
		"1215": "완도군",
		"1216": "장성군",
		"1217": "장흥군",
		"1218": "진도군",
		"1219": "함평군",
		"1220": "해남군",
		"1221": "화순군"
	},
	"13":{
		"1300": "경산시",
		"1301": "경주시",
		"1302": "고령군",
		"1303": "구미시",
		"1304": "군위군",
		"1305": "김천시",
		"1306": "문경시",
		"1307": "상주시",
		"1308": "성주군",
		"1309": "안동시",
		"1310": "영덕군",
		"1311": "영양군",
		"1312": "영주시",
		"1313": "영천시",
		"1314": "예천군",
		"1315": "울릉군",
		"1316": "울진군",
		"1317": "의성군",
		"1318": "청도군",
		"1319": "청송군",
		"1320": "칠곡군",
		"1321": "포항시 남구",
		"1322": "포항시 북구"
	},
	"14":{
		"1400": "거제시",
		"1401": "고성군",
		"1402": "김해시",
		"1403": "남해군",
		"1404": "밀양시",
		"1405": "사천시",
		"1406": "산청군",
		"1407": "양산시",
		"1408": "의령군",
		"1409": "진주시",
		"1410": "창녕군",
		"1411": "창원시 마산 함포구",
		"1412": "창원시 마산 회원구",
		"1413": "창원시 성산구",
		"1414": "창원시 의창구",
		"1415": "창원시 진해구",
		"1416": "통영시",
		"1417": "하동군",
		"1418": "함안군",
		"1419": "함양군",
		"1420": "합천군"
	},
	"15":{
		"1500": "서귀포시",
		"1501": "제주시"
	}
};
var serviceCategoryArray = {
	code: ["00", 
	       "01", 
	       "02", 
	       "03", 
	       "04", 
	       "05", 
	       "06", 
	       "07",
	       "08", 
	       "09", 
	       "10",
	       "11",
	       "12",
	       "99"],
	value: ["자동차", 
	        "부동산", 
	        "금융/대출",
	        "교육",
	        "광고/인쇄", 
	        "물품 판매 매입", 
	        "인터넷 통신 상품", 
	        "세무/법무", 
	        "운송/이사/택배", 
	        "병원/한의원", 
	        "영업/PR", 
	        "IT 서비스",
	        "헤드헌터",
	        "기타"]
};