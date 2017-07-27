카카오스토리 링크SDK (Mobile Web)
==============

카카오스토리 링크SDK를 이용하여 사용자가 웹사이트에서 카카오스토리로 글을 올릴 수 있습니다.<br>
이와는 별도로 로그인 후 앱에서 카카오스토리로 직접 포스팅할 수 있는 API를 [카카오 개발자 사이트](https://dev.kakao.com)에서 제공하니 참고하세요!

모바일 웹에서 [카카오스토리 링크 데모](http://kakao.github.com/kakaolink-web/)를 확인할 수 있습니다.

** 카카오톡 링크는 [카카오 개발자 사이트에서 제공하는 Javascript SDK](https://dev.kakao.com/docs/js#카카오톡-링크)를 통해 사용 가능합니다.

텍스트/URL 포스팅하기
-------------
모바일웹에서 텍스트(url 포함 가능)를 카카오스토리로 포스팅할 수 있습니다. 본문에 url이 포함되어 있을 경우 해당 페이지의 썸네일 이미지, 제목, 설명이 자동으로 스크랩되어 포스팅 됩니다. 원하는 정보를 전달하려면 파라미터 중 urlinfo를 활용할 수 있습니다.
> * 지원 OS: iOS, Android, 모바일웹
> * 카카오스토리에서의 '스크랩 타입'에 대한 정의는 [http://www.kakao.com/link/ko/api_story?tab=mobile](http://www.kakao.com/link/ko/api_story?tab=mobile) 의 내용을 참조하십시오.

#### 파라미터 설명

파라미터 이름 	| type	| 필수 여부 | 설명 				| 비고
---			| ---		| ---		| ---				| ---
post			| String	| O 		| 사용자 메시지 내용(UTF-8) 또는 URL<br/> * 본문에 url이 포함되어 있을 경우 해당 페이지의 썸네일 이미지, 제목, 설명이 자동으로 스크랩되어 포스팅 됩니다. 원하는 정보를 전달하려면 파라미터 중 `urlinfo`를 활용할 수 있습니다.<br/> * 본문에 url이 없는 경우엔 urlinfo를 보내도 동작하지 않습니다. |
appid		| String 	| O		| Mobile Site Domain<br/>정확히 입력하지 않을 경우 이용이 제한될 수 있습니다. |
appver		| String 	| O 		| Mobile Site Version	|
apiver		| String 	| O		| 카카오링크 API 버전		| 1.0 (고정값)  
appname		| String	| O		| Mobile Site 의 정확한 이름 | host(출처)로 이용되니 정확히 기재
urlinfo		| JSON Object | X 	| 스크랩 기능이 동작될 경우 원하는 정보를 보여주기 위한 설정 정보 | 아래 'urlinfo 설명' 참조


#### urlinfo 설명

파라미터 이름 	| 필수 여부 | 설명 				| 비고
---			| ---		| ---					| ---
title			| O 		| 스크랩 형태에 표시되는 제목 |
desc		 	| X		| 스크랩 형태에 표시되는 설명  |
imageurl		| X		| 스크랩 형태에 표시되는 대표이미지 url<br/>(JSON Object의 String Array 형식으로 지원) |
executeurl	| X 		| 스크랩 형태에 사용되는 type | video, music, book, article, profile, website<br/>기본값은 website


#### 사용 예


```js
  <script type="text/javascript" src="./kakao.link.js"></script>
  <script type="text/javascript">
  function executeKakaoStoryLink()
  {
    kakao.link("story").send({
        post : "http://m.media.daum.net/entertain/enews/view?newsid=20120927110708426",
        appid : "m.media.daum.net",
        appver : "1.0",
        appname : "미디어다음",
        urlinfo : JSON.stringify({title:"(광해) 실제 역사적 진실은?", desc:"(광해 왕이 된 남자)의 역사성 부족을 논하다.", imageurl:["http://m1.daumcdn.net/photo-media/201209/27/ohmynews/R_430x0_20120927141307222.jpg"], type:"article"})
    });
  }
  </script>
```

카카오스토리 B.I 다운로드
--------------------------

### [KakaoStory Buttons](https://dev.kakao.com/buttons)

*B.I는 카카오링크를 이용하여 카카오스토리로 포스팅하는 기능을 안내하는 버튼/페이지에 한하여 사용하셔야 하며, 다른 페이지나 메뉴 등에서 위 이미지를 그대로 또는 일부 변형하여 사용자가 카카오 제작 앱으로 혼동하게 하시면 안됩니다.
