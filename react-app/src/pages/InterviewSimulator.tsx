import React, { useState ,useEffect } from 'react';
import { useInterviewState } from '../hooks/useInterviewState';
import InterviewSetup from '../components/InterviewSetup';
import InterviewPanel from '../components/InterviewPanel';
import ChatPanel from '../components/ChatPanel';
import EmotionBarChart from '../components/EmotionBarChart'; // 경로에 따라 조정
import PosturePieChart from '../components/PosturePieChart';
export interface AudioAnalysisResult {
  text: string;
  emotion: string;
  probabilities: Record<string, number>;
}
interface FinalAnalysis {
  audio_summary: {
    overall_emotion: string;
    highlight_question: {
      question: string;
      emotion: string;
      commentary: string;
    };
    feedback: string;
  };

  audio_visual_analysis: {
    visual_data: {
      question: string;
      emotion: string;
      [emotionType: string]: string | number; // 확률 포함
    }[];
    average_emotion_scores: Record<string, number>;
    most_common_emotion: string;
    summary_stats: {
      num_questions: number;
      unique_emotions: number;
      top_emotion_ratio: number;
    };
  };

  video_summary: {
    overall_emotion: string;
    highlight_frame: {
      timestamp: string;
      emotion: string;
      commentary: string;
    };
    feedback: string;
  } | null;


  video_visual_analysis: {
    average_metrics: Record<string, number>;
    most_common_emotion: string;
    summary_stats: {
      num_frames: number;
      unique_emotions: number;
      top_emotion_ratio: number;
      posture_distribution: Record<string, number>;
    };
  } | null;

  final_feedback: {
    overall_attitude: string;
    voice_emotion_summary: string;
    posture_summary: string;
    answer_quality: string;
    improvement_suggestions: string;
  } | null;
}


const InterviewSimulator: React.FC = () => {
  const {
    numQuestions,
    setNumQuestions,
    interviewSession,
    currentQuestionIndex,
    chatMessages,
    step,
    isInterviewComplete,
    isLoading,
    startInterview,
    handleNextQuestion,
    
    addMessageToChat,
    setSelectedJob,
    selectedJob,
    jobUrl,            // ✅ 가져옴
    setJobUrl,         // ✅ 가져옴
  } = useInterviewState();

  const [isRecording, setIsRecording] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [voiceResult, setVoiceResult] = useState('분석 대기 중');
  const [audioAnalysisResult, setAudioAnalysisResult] = useState<AudioAnalysisResult | null>(null);
  const token1 = localStorage.getItem('access_token') ?? '';
  const currentQuestion = interviewSession?.questions[currentQuestionIndex] ?? '';
  const interviewId = interviewSession?.interview_id;
  const [finalAnalysis, setFinalAnalysis] = useState<FinalAnalysis | null>(null);


  useEffect(() => {
    const fetchAnalysis = async () => {
      if (step !== 'results'||!interviewId) return;
      try {
        const res = await fetch(`http://localhost:8000/api/user/interview/${interviewId}/analysis`);
        if (!res.ok) throw new Error('분석 결과 요청 실패');
        const data = await res.json();
        setFinalAnalysis(data);
      } catch (err) {
        console.error('❌ 분석 결과 요청 실패:', err);
      }
    };

    if (step === 'results') {
      setIsRecording(false);
      setCameraOn(false);
      fetchAnalysis();
    }
  }, [step, interviewId]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {step === 'setup' && (
        <InterviewSetup
          jobUrl={jobUrl}
          onJobUrlChange={setJobUrl}
          selectedJob={selectedJob}
          onSelectJob={setSelectedJob}
          numQuestions={numQuestions}
          onChangeNum={setNumQuestions}
          onStart={() => {
            setCameraOn(true);
            startInterview();
          }}
          isLoading={isLoading}
        />
      )}

      {step === 'interview' && interviewSession && (
        <div style={{ display: 'flex', height: '100vh' }}>
          <InterviewPanel
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            token={token1}
            userId="admin"
            interviewId={interviewId ?? ''}
            cameraOn={cameraOn}
            selectedJob={selectedJob}
            voiceResult={voiceResult}
            currentQuestion={currentQuestion}
            audioAnalysisResult={audioAnalysisResult}
            onResult={(result: AudioAnalysisResult) => {
              setVoiceResult(result.text);
              setAudioAnalysisResult(result);
              addMessageToChat('answer', result.text, currentQuestionIndex + 1);
              handleNextQuestion();
            }}
            onCameraReady={() => setCameraOn(true)}
          />
          <ChatPanel chatMessages={chatMessages} />
        </div>
      )}
      {step === 'results' && (
  <div style={{ padding: '4rem', textAlign: 'center' }}>
    <h1>🎉 면접이 종료되었습니다!</h1>
    {!finalAnalysis ? (
      <>
        <p style={{ marginTop: '2rem' }}>🔄 분석 결과를 불러오는 중입니다...</p>
        <div className="spinner" style={{ margin: '2rem auto' }} />
      </>
    ) : !finalAnalysis.audio_summary ? (
      <>
        <p>❌ 감정 요약 데이터를 불러오지 못했습니다.</p>
      </>
    ) : (
      <>
        {/* 📊 감정 통계 요약 */}
        <section style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '700px', marginInline: 'auto' }}>
          <h2>📊 음성 감정 통계 요약</h2>
          <p>전체 질문 수: <strong>{finalAnalysis.audio_visual_analysis.summary_stats.num_questions}</strong></p>
          <p>감정 종류 수: <strong>{finalAnalysis.audio_visual_analysis.summary_stats.unique_emotions}</strong></p>
          <p>가장 자주 나타난 감정: <strong>{finalAnalysis.audio_visual_analysis.most_common_emotion}</strong> ({finalAnalysis.audio_visual_analysis.summary_stats.top_emotion_ratio * 100}%)</p>
        </section>

        {/* 평균 감정 분포 시각화 */}
        <section style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '700px', marginInline: 'auto' }}>
          <h2>📈 음성 데이터 평균 감정 분포</h2>
          {finalAnalysis?.audio_visual_analysis?.average_emotion_scores ? (
            <EmotionBarChart data={finalAnalysis.audio_visual_analysis.average_emotion_scores} />
          ) : (
            <p>📉 감정 분포 데이터가 없습니다.</p>
          )}
        </section>
                    {/* 🎥 영상 감정 통계 요약 */}
            {finalAnalysis.video_visual_analysis && (
              <section style={{ marginTop: '3rem', textAlign: 'left', maxWidth: '700px', marginInline: 'auto' }}>
                <h2>🎥 영상 감정 통계 요약</h2>
                <p>전체 프레임 수: <strong>{finalAnalysis.video_visual_analysis.summary_stats.num_frames}</strong></p>
                <p>감정 종류 수: <strong>{finalAnalysis.video_visual_analysis.summary_stats.unique_emotions}</strong></p>
                <p>가장 자주 나타난 감정: <strong>{finalAnalysis.video_visual_analysis.most_common_emotion}</strong> ({finalAnalysis.video_visual_analysis.summary_stats.top_emotion_ratio * 100}%)</p>
              </section>
            )}

            {/* 📈 평균 얼굴/자세 메트릭 */}
            {finalAnalysis.video_visual_analysis?.average_metrics && (
                <section style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '700px', marginInline: 'auto' }}>
                  <h2>📐 평균 얼굴 및 자세 지표 (시각화)</h2>
                  <EmotionBarChart data={finalAnalysis.video_visual_analysis.average_metrics} />
                </section>
              )}


          {/* 🧍 자세 분포 시각화 */}
          {finalAnalysis.video_visual_analysis?.summary_stats?.posture_distribution && (
            <section style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '700px', marginInline: 'auto' }}>
              <h2>🧍 자세 분포 시각화</h2>
              <PosturePieChart data={finalAnalysis.video_visual_analysis.summary_stats.posture_distribution} />
            </section>
          )}
    

        {/* 🧠 전체 감정 요약 */}
        <section style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '700px', marginInline: 'auto' }}>
          <h2>🧠 전체 감정,태도,답변 평가</h2>
          <p>면접 전체에서 가장 두드러진 감정은 <strong>{finalAnalysis.audio_summary.highlight_question.emotion}</strong>입니다.</p>
        </section>

        {/* 🎯 하이라이트 질문 */}
        <section style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '700px', marginInline: 'auto' }}>
            <h2>🎯 감정적으로 두드러진 질문</h2>
            <p><strong>질문:</strong> {finalAnalysis.audio_summary.highlight_question.question}</p>
            <p><strong>감정:</strong> {finalAnalysis.audio_summary.highlight_question.emotion}</p>
            <p><strong>해설:</strong> {finalAnalysis.audio_summary.highlight_question.commentary}</p>
        </section>
       {finalAnalysis.final_feedback && (
            <section style={{ marginTop: '3rem', textAlign: 'left', maxWidth: '700px', marginInline: 'auto' }}>
              <h2>🧾 최종 면접 요약 및 피드백</h2>
              <p><strong>🧍 전체 태도 요약:</strong> {finalAnalysis.final_feedback.overall_attitude}</p>
              <p><strong>🎤 음성 감정 요약:</strong> {finalAnalysis.final_feedback.voice_emotion_summary}</p>
              <p><strong>📹 자세 및 시각 요약:</strong> {finalAnalysis.final_feedback.posture_summary}</p>
              <p><strong>🧠 답변 품질 평가:</strong> {finalAnalysis.final_feedback.answer_quality}</p>
              <p><strong>🛠️ 개선할 점:</strong> {finalAnalysis.final_feedback.improvement_suggestions}</p>
            </section>
          )}
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '3rem' }}
        >
          다시 시작하기
        </button>
      </>
    )}
  </div>
)}


    </div>
  );
};

export default InterviewSimulator;
