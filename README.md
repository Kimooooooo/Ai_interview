실시간 AI 면접 피드백 시스템
취업 준비생의 비언어적 습관과 답변 역량을 실시간으로 분석하여 종합 피드백을 제공하는 웹 서비스입니다.

1. 프로젝트 요약
2025년 신입 취업 시장의 경력 선호 현상과 좁아진 면접 기회 문제를 해결하기 위해 기획되었습니다. 사용자가 웹캠과 마이크를 통해 면접을 진행하면, 딥러닝 모델이 음성 감정과 영상 내의 자세/표정을 실시간 분석하고 LLM이 최종 리포트를 생성합니다.

2. 사용 기술
Backend
Framework: FastAPI

Database: MySQL

Auth: PyJWT (JWT 기반 보안 인증)

API: OpenAI API (질문 생성 및 최종 피드백), NAVER CLOVA STT

Frontend
Library: React (TypeScript)

Real-time: WebSocket API (영상 데이터 송수신)

Vision: Mediapipe (얼굴 및 자세 랜드마크 추출)

Audio: Web Audio API, MediaRecorder API

AI & Deep Learning
Audio Model: CNN-BiLSTM (음성 멜 스펙트로그램 기반 7개 감정 분류)

Video Model: DeepFace (표정 분석) + MLP (시선/눈 깜빡임/자세 기반 상태 분류)

Processing: Librosa, NumPy, Scipy

3. 실행 화면
<img width="984" height="430" alt="image" src="https://github.com/user-attachments/assets/0f39d6c2-ff0c-4dc1-97c6-935e0e3bae5c" />
<img width="929" height="456" alt="image" src="https://github.com/user-attachments/assets/9a8df6eb-ecf6-4ae6-bafb-4bf06835b1b4" />

4. 워크플로우 (담당 기능)
본 프로젝트에서 LLM 기반 피드백 엔진 및 시스템 통합을 담당했습니다.

1. 맞춤형 질문 생성: 지원 직무와 채용공고 URL을 분석하여 실무 중심의 면접 질문 리스트를 동적 생성합니다.
2. 멀티모달 데이터 파이프라인: 음성 감정 확률 분포와 영상 자세 분석 데이터를 수집하여 LLM 평가 컨텍스트로 변환합니다.
3. 구조화된 피드백 생성: 정량적 수치 데이터를 바탕으로 전체 면접 태도, 음성 흐름, 답변 품질, 개선점(STAR 기법 적용 등)을 포함한 JSON 형태의 종합 리포트를 산출합니다.

