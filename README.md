# Cocktail Curling — Vercel 배포판

기준: A 최신 버전(25029285f84bc4fbac66d607677f4d9965aff90c). 잔 잘림 수정과 공유 버튼 통합 포함.

## 구성
- 게임 HTML/이미지: Vercel에서 제공.
- `/api/me`, `/api/ranking`, `/api/run`, `/api/score`: Vercel 함수가 기존 A 서버로 전달.
- 기존 D1 점수/랭킹을 유지합니다. **독립 DB 이전판이 아니며 기존 A 공개 서버를 유지해야 합니다.**
- 새 도메인은 브라우저 쿠키가 달라 기존 개인 닉네임/최고점수의 소유권을 자동 이전하지 않습니다. 전체 랭킹에는 기존 기록이 남습니다.
- 점수 공유 링크는 현재 접속 도메인을 사용합니다.

## 배포
이 폴더를 GitHub 저장소 루트로 올린 후 Vercel에서 Import합니다.
Framework: Other / Build: npm run build / Output: public / Node: 22.x.
환경변수와 별도 DB 구매 없이 현재 A 서버를 연결합니다.
커스텀 도메인을 붙일 경우 PUBLIC_SITE_URL을 해당 https 주소로 지정하고 재배포합니다.
친구들이 접속할 수 있도록 Production의 Deployment Protection 설정을 확인합니다.

## 확인
npm test
npm run build
배포 후 신규 브라우저에서 시작 → 플레이 → 게임오버 → 닉네임 저장 → 랭킹 → 공유 링크를 확인합니다.

설정 근거: https://vercel.com/docs/functions/runtimes/node-js
