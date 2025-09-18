/*
package.json
"dependencies": {
    "cors": "^2.8.5", //다른 출처의 선택한 리소스에 접근할 수 있는 권한을 부여하도록 브라우저에 알려주는 메커니즘
    "dotenv": "^17.2.2", //개인정보를 손쉽게 처리할수있는 
    "express": "^5.1.0",
    "openai": "^5.21.0" //이 라이브러리를 사용해야 api 연결 가능
  }

쌤 노션: https://charmed-summer-94a.notion.site/AI-13ebc95bcb948089a981d4119268b71b#13ebc95bcb9480098b81e1d1b7f58cfd
깃헙: https://github.com/juju760/chat-chef-frontend
*/

import express from "express";
import cors from "cors";
// 패키지 가져오기
import OpenAI from "openai";
import * as dotenv from "dotenv";
//import path from "path";

const app = express();

app.use(cors());

// 프론트엔드에서 받은 json 형태의 데이터를 자바스크립트 객체로 파싱하여 사용 
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// env 설정
dotenv.config(); // 환경변수 로드

// openai 정보 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(process.env.OPENAI_API_KEY);

// 챗봇 api설정
const initialMessage = (ingredientList) => {
  return [
    {
      role: "system", //맨첨에 셋팅하는 부분 (초기 딱 1번)
      content: `당신은 "맛있는 쉐프"라는 이름의 전문 요리사입니다. 사용자가 재료 목록을 제공하면, 첫번째 답변에서는 오직 다음 문장만을 응답으로 제공해야 합니다. 다른 어떤 정보도 추가하지 마세요: 제공해주신 재료 목록을 보니 정말 맛있는 요리를 만들 수 있을 것 같아요. 어떤 종류의 요리를 선호하시나요? 간단한 한끼 식사, 특별한 저녁 메뉴, 아니면 가벼운 간식 등 구체적인 선호도가 있으시다면 말씀해 주세요. 그에 맞춰 최고의 레시피를 제안해 드리겠습니다!`,
    },
    {
      role: "user", //사용자가 입력하는 프롬프트 
      content: `안녕하세요, 맛있는 쉐프님. 제가 가진 재료로 요리를 하고 싶은데 도와주실 수 있나요? 제 냉장고에 있는 재료들은 다음과 같아요: ${ingredientList
        .map((item) => item.value)
        .join(", ")}`,
    },
  ];
};

// 초기 답변
app.post("/recipe", async (req, res) => {
  const { ingredientList } = req.body; // 프론트엔드에서 요청한 재료목록 데이터 
  const messages = initialMessage(ingredientList);
  console.log("message",messages);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 1, // 템퍼러쳐를 0이라고 하면.......... 딱딱하지만 정확해짐. 
      max_tokens: 4000,
      top_p: 1,
    });
    const data = [...messages, response.choices[0].message];
    //response: 챗gpt가 응답해준 대답. 
    console.log("data", data);
    res.json({ data });
  } catch (error) {
    console.log(error);
  }
});

// 유저와의 채팅
app.post("/message", async (req, res) => {
  const { userMessage, messages } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [...messages, userMessage],
      temperature: 1,
      max_tokens: 4000,
      top_p: 1,
    });
    const data = response.choices[0].message;
    res.json({ data });
  } catch (error) {
    console.log(error);
  }
});

// 테스트용 API
// req: 프론트-> 백엔드 [요청]
// res: 백엔드-> 프론트 [응답]
app.get("/", (req, res)=>{
  // 이 API가 호출됐을때 실행할 로직
  // try-catch 구문: 예외(에러)처리
  try{
    //프론트엔드에게 응답 
    res.json({ data: "후츠릿"});
  }catch(error){
    //예외 발생시 처리할 코드
    console.log(error);
  }
});

app.listen(8080,()=>{
  console.log("서버ON");
});