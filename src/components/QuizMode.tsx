'use client'

import { useState, useEffect, useRef } from 'react'
import { OpenRouterAPIService } from '@/services/openrouter-api'
import { getMockDocumentChunks } from '@/services/document-loader'
import { getSampleQuestions } from '@/data/sample-questions'

// Tạo một instance của OpenRouterAPI
const openRouterApi = new OpenRouterAPIService();

// Cấu trúc câu hỏi trắc nghiệm
interface MultipleChoiceQuestion {
  type: 'multiple_choice';
  question: string;
  options: string[];
  correctAnswer: number; // index của đáp án đúng
  explanation: string;
}

// Loại câu hỏi (chỉ có một loại - trắc nghiệm)
type Question = MultipleChoiceQuestion;

// Cấu trúc cho phản hồi của người dùng
interface UserAnswer {
  questionIndex: number;
  answer: number;
  isCorrect: boolean;
}

export default function QuizMode() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');
  const [difficulty, setDifficulty] = useState('normal');
  const [generating, setGenerating] = useState(false);
  const [documentChunks, setDocumentChunks] = useState<string[]>([]);
  const [isAiGenerated, setIsAiGenerated] = useState(true); // Track if questions are AI generated
  const [submittedAnswer, setSubmittedAnswer] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Effect để render công thức toán học mỗi khi câu hỏi thay đổi
  useEffect(() => {
    if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
      setTimeout(() => {
        try {
          window.MathJax.typesetPromise()
            .then(() => {
              console.log('QuizMode: MathJax typesetting completed successfully');
            })
            .catch((err: any) => {
              console.error('QuizMode: MathJax typesetting error:', err);
            });
        } catch (err) {
          console.error('QuizMode: Error running MathJax typeset:', err);
        }
      }, 100);
    }
  }, [currentQuestionIndex, submittedAnswer, questions, selectedOption]);

  // Add an event listener to handle any UI interactions that might affect MathJax rendering
  useEffect(() => {
    const handleGlobalClick = () => {
      // Short delay to ensure the DOM has been updated
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
          try {
            console.log('QuizMode: Re-running MathJax typeset after UI interaction');
            window.MathJax.typesetPromise()
              .then(() => {
                console.log('QuizMode: Post-interaction MathJax typesetting completed');
              })
              .catch((err: any) => {
                console.error('QuizMode: MathJax typesetting error after interaction:', err);
              });
          } catch (err) {
            console.error('QuizMode: Error running MathJax typeset:', err);
          }
        }
      }, 100);
    };

    // Add the event listener
    document.addEventListener('click', handleGlobalClick);
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Nạp dữ liệu từ tài liệu mẫu khi component được khởi tạo
  useEffect(() => {
    async function loadDocumentChunks() {
      try {
        const chunks = await getMockDocumentChunks();
        setDocumentChunks(chunks);
        console.log(`Loaded ${chunks.length} document chunks for quiz generation`);
      } catch (error) {
        console.error('Error loading document chunks:', error);
      }
    }
    
    loadDocumentChunks();
  }, []);

  // Nạp các câu hỏi mẫu khi component được khởi tạo và khi đã có documentChunks
  useEffect(() => {
    if (questions.length === 0 && !generating && documentChunks.length > 0) {
      generateQuestions();
    }
  }, [documentChunks]);

  // Hàm tạo câu hỏi từ API
  const generateQuestions = async () => {
    if (documentChunks.length === 0) {
      console.error('No document chunks available for quiz generation');
      return;
    }

    setGenerating(true);
    setLoading(true);
    setIsAiGenerated(true); // Reset to true when generating new questions
    setSubmittedAnswer(false);
    setSelectedOption(null);
    setUserAnswers([]); // Clear previous answers when generating new questions

    try {
      // Nối các đoạn tài liệu để tạo context cho AI
      const context = documentChunks.join('\n\n');
      
      // Tạo prompt để yêu cầu AI tạo câu hỏi đa dạng và phong phú hơn
      const prompt = `Dưới đây là nội dung về Lý thuyết Thông tin. Hãy dựa vào tài liệu này để tạo 5 câu hỏi trắc nghiệm ngẫu nhiên ở mức độ ${
        difficulty === 'easy' ? 'dễ' : difficulty === 'hard' ? 'khó' : 'trung bình'
      }${quizTopic ? ` về chủ đề ${quizTopic}` : ''}.

      Tài liệu tham khảo:
      ${context}

      Yêu cầu:
      1. Tạo 5 câu hỏi trắc nghiệm đa dạng và phong phú, không trùng lặp với các câu hỏi đã tạo trước đó
      2. Mức độ khó: 
        - ${difficulty === 'easy' ? 'DỄ: câu hỏi cơ bản về định nghĩa, có ít hoặc không có tính toán, kiến thức nền tảng dễ nhớ' : 
          difficulty === 'hard' ? 'RẤT KHÓ: câu hỏi cực kỳ thách thức đòi hỏi kiến thức chuyên sâu, tính toán phức tạp đa bước, kết hợp nhiều công thức và khái niệm, cần phân tích kỹ và chứng minh toán học, có tư duy phản biện cao. Các câu hỏi có thể yêu cầu tính toán entropy có điều kiện, dung lượng kênh trong điều kiện nhiễu phức tạp, hoặc tính toán lượng thông tin tương hỗ với nhiều biến.' : 
          'TRUNG BÌNH: cân bằng giữa lý thuyết và ứng dụng, có tính toán nhưng không quá phức tạp, đòi hỏi hiểu biết vững về các công thức cơ bản'} 
      3. Trong 5 câu hỏi, phải có ít nhất ${difficulty === 'easy' ? '2' : difficulty === 'hard' ? '5' : '3'} câu hỏi yêu cầu tính toán chi tiết 
      4. ${difficulty === 'hard' ? 'Tất cả các câu hỏi ở mức khó PHẢI có ít nhất 3-4 bước tính toán trung gian và kết hợp 2-3 công thức khác nhau. Các phương án nhiễu phải rất gần với đáp án đúng, chỉ khác nhau ở các bước tính toán tinh tế.' : 'Mỗi câu hỏi có 4 đáp án (A, B, C, D), trong đó chỉ có một đáp án đúng'}
      5. Bao gồm giải thích chi tiết cho đáp án đúng với các bước tính toán nếu có
      6. Các câu hỏi phải đa dạng về chủ đề, độ khó và cách tiếp cận
      7. Tất cả câu hỏi phải dựa vào thông tin trong tài liệu trên
      8. Các bài toán tính toán phải có đầy đủ các bước tính và giải thích chi tiết trong phần explanation
      9. Sử dụng cú pháp LaTeX cho tất cả các công thức toán học (ví dụ: $H(X) = -\\sum_{i} p(x_i) \\log p(x_i)$ cho inline và $$H(X) = -\\sum_{i} p(x_i) \\log p(x_i)$$ cho block)
      10. Cả câu hỏi, các đáp án, và phần giải thích đều phải được định dạng toán học đúng cách
      ${difficulty === 'hard' ? '11. Phải đưa vào các câu hỏi liên quan đến khái niệm phức tạp như entropy có điều kiện, dung lượng kênh, lượng thông tin tương hỗ, mã hóa nguồn, mã hóa kênh, định lý Shannon-Hartley, và các biến thể của entropy. Ít nhất một câu hỏi phải đòi hỏi xem xét giới hạn lý thuyết nào đó.' : ''}

      Hãy trả về dữ liệu dưới dạng JSON với mảng các câu hỏi có định dạng:
      [
        {
          "type": "multiple_choice",
          "question": "Nội dung câu hỏi (có thể bao gồm các công thức toán học nếu cần)",
          "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
          "correctAnswer": 0,  // index của đáp án đúng (0 đến 3)
          "explanation": "Giải thích chi tiết đáp án đúng, bao gồm cách tính toán nếu là câu hỏi tính toán"
        },
        ...
      ]
      
      Chỉ trả về JSON, không kèm theo bất kỳ văn bản nào khác.`;

      try {
        // Gọi API để tạo câu hỏi
        const response = await openRouterApi.generateResponse(prompt);
        
        // Tìm và parse phần JSON từ phản hồi
        const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          const parsedQuestions = JSON.parse(jsonString) as Question[];
          setQuestions(parsedQuestions);
          setCurrentQuestionIndex(0);
          setUserAnswers([]);
          setSelectedOption(null);
          setIsAiGenerated(true);
          setSubmittedAnswer(false);
        } else {
          console.error('Không tìm thấy định dạng JSON trong phản hồi:', response);
          throw new Error('Không thể phân tích cú pháp câu hỏi');
        }
      } catch (error) {
        console.error('Lỗi khi tạo hoặc phân tích câu hỏi từ API:', error);
        
        // Sử dụng câu hỏi mẫu nếu API gặp lỗi
        console.log('Sử dụng câu hỏi mẫu thay thế');
        const difficultyLevel = difficulty === 'easy' ? 'easy' : difficulty === 'hard' ? 'hard' : 'normal';
        const sampleQuestionsData = getSampleQuestions('multiple_choice', difficultyLevel as any, 5);
        setQuestions(sampleQuestionsData);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setSelectedOption(null);
        setSubmittedAnswer(false);
        setIsAiGenerated(false);
      }
    } catch (error) {
      console.error('Lỗi khi tạo câu hỏi:', error);
      
      // Sử dụng câu hỏi mẫu nếu hoàn toàn không thể tạo câu hỏi
      const difficultyLevel = difficulty === 'easy' ? 'easy' : difficulty === 'hard' ? 'hard' : 'normal';
      const sampleQuestionsData = getSampleQuestions('multiple_choice', difficultyLevel as any, 5);
      setQuestions(sampleQuestionsData);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedOption(null);
      setSubmittedAnswer(false);
      setIsAiGenerated(false);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  // Hàm xử lý khi người dùng gửi câu trả lời
  const handleSubmitAnswer = () => {
    if (currentQuestionIndex >= questions.length || selectedOption === null) {
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    // Cập nhật danh sách câu trả lời
    const newAnswer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      answer: selectedOption,
      isCorrect
    };

    // Kiểm tra xem câu hỏi đã được trả lời trước đó chưa
    const existingAnswerIndex = userAnswers.findIndex(a => a.questionIndex === currentQuestionIndex);
    
    if (existingAnswerIndex !== -1) {
      // Nếu câu hỏi đã được trả lời, cập nhật câu trả lời
      const updatedAnswers = [...userAnswers];
      updatedAnswers[existingAnswerIndex] = newAnswer;
      setUserAnswers(updatedAnswers);
    } else {
      // Nếu câu hỏi chưa được trả lời, thêm câu trả lời mới
      setUserAnswers(prev => [...prev, newAnswer]);
    }
    
    setSubmittedAnswer(true);
    
    // Đảm bảo MathJax sẽ được render lại
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
        try {
          window.MathJax.typesetPromise()
            .then(() => {
              console.log('QuizMode: MathJax typesetting completed after answer submission');
            })
            .catch((err: any) => {
              console.error('QuizMode: MathJax typesetting error after answer submission:', err);
            });
        } catch (err) {
          console.error('QuizMode: Error running MathJax typeset after answer submission:', err);
        }
      }
    }, 100);
  };

  // Chuyển sang câu hỏi tiếp theo
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSubmittedAnswer(false);

      // Kiểm tra xem câu hỏi tiếp theo đã được trả lời chưa
      const nextAnswer = userAnswers.find(answer => answer.questionIndex === currentQuestionIndex + 1);
      if (nextAnswer) {
        setSelectedOption(nextAnswer.answer);
        setSubmittedAnswer(true);
      } else {
        setSelectedOption(null);
      }
      
      // Scroll to top of question content
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      
      // Ensure MathJax rendering after navigation
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
          try {
            window.MathJax.typesetPromise();
          } catch (err) {
            console.error('QuizMode: Error running MathJax typeset after navigation:', err);
          }
        }
      }, 100);
    }
  };

  // Quay lại câu hỏi trước
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      
      // Hiển thị câu trả lời đã lưu (nếu có)
      const previousAnswer = userAnswers.find(answer => answer.questionIndex === currentQuestionIndex - 1);
      if (previousAnswer) {
        setSelectedOption(previousAnswer.answer);
        setSubmittedAnswer(true);
      } else {
        setSelectedOption(null);
        setSubmittedAnswer(false);
      }
      
      // Scroll to top of question content
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      
      // Ensure MathJax rendering after navigation
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
          try {
            window.MathJax.typesetPromise();
          } catch (err) {
            console.error('QuizMode: Error running MathJax typeset after navigation:', err);
          }
        }
      }, 100);
    }
  };

  // Xử lý nội dung để hiển thị đúng các công thức toán học
  const processMathContent = (content: string) => {
    return content;
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p>Đang tạo câu hỏi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 p-4 max-w-4xl mx-auto" ref={contentRef}>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Chế độ luyện tập</h2>
        
        {/* Thông tin về cách tạo câu hỏi */}
        <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
          <p className="font-medium">
            {isAiGenerated 
              ? "Các câu hỏi trắc nghiệm được tạo ngẫu nhiên bởi trí tuệ nhân tạo dựa trên thông tin về Lý thuyết Thông tin."
              : "Đang sử dụng câu hỏi dự phòng. Vui lòng thử lại sau để nhận câu hỏi được tạo ngẫu nhiên bởi AI."}
          </p>
        </div>
        
        {/* Form tạo câu hỏi */}
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Tùy chỉnh bài luyện tập</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Chủ đề (tùy chọn)</label>
              <input
                type="text"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="Để trống để lấy tất cả chủ đề"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Độ khó</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="easy">Dễ</option>
                <option value="normal">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={generateQuestions}
            disabled={generating || loading}
            className={`w-full py-2 px-4 rounded font-medium ${
              generating || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {generating ? 'Đang tạo câu hỏi...' : 'Tạo câu hỏi ngẫu nhiên'}
          </button>
        </div>

        {/* Hiển thị thông báo khi không có tài liệu */}
        {documentChunks.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg mb-4">
            <p className="text-yellow-800">
              Đang tải tài liệu học tập... Vui lòng chờ trong giây lát.
            </p>
          </div>
        )}
        
        {/* Hiển thị câu hỏi và câu trả lời */}
        {questions.length > 0 && currentQuestionIndex < questions.length && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">
                Câu hỏi {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border-2 border-blue-200 math-content">
              <p className="text-lg font-medium mb-1" dangerouslySetInnerHTML={{ __html: processMathContent(questions[currentQuestionIndex].question) }}></p>
            </div>
            
            <div className="space-y-2 mb-4">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <div 
                  key={index}
                  onClick={() => {
                    if (!submittedAnswer) {
                      setSelectedOption(index);
                      // Trigger MathJax rendering after state update
                      setTimeout(() => {
                        if (window.MathJax && window.MathJax.typesetPromise) {
                          window.MathJax.typesetPromise();
                        }
                      }, 10);
                    }
                  }}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors math-content ${
                    selectedOption === index 
                      ? 'bg-blue-100 border-blue-500' 
                      : 'hover:bg-gray-100 border-gray-300'
                  } ${
                    submittedAnswer && index === questions[currentQuestionIndex].correctAnswer
                      ? 'bg-green-100 border-green-500'
                      : (submittedAnswer && selectedOption === index && selectedOption !== questions[currentQuestionIndex].correctAnswer)
                        ? 'bg-red-100 border-red-500'
                        : ''
                  }`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                  <span dangerouslySetInnerHTML={{ __html: processMathContent(option) }}></span>
                </div>
              ))}
            </div>
            
            {/* Hiển thị kết quả đánh giá và giải thích khi đã trả lời */}
            {submittedAnswer && (
              <div className="mb-4">
                <div className={`p-3 rounded-lg ${
                  userAnswers.find(a => a.questionIndex === currentQuestionIndex)?.isCorrect
                    ? 'bg-green-50 border border-green-300'
                    : 'bg-red-50 border border-red-300'
                }`}>
                  <h3 className="font-bold mb-2">
                    {userAnswers.find(a => a.questionIndex === currentQuestionIndex)?.isCorrect
                      ? '✓ Đáp án đúng!' 
                      : `✗ Đáp án sai! Đáp án đúng là ${String.fromCharCode(65 + questions[currentQuestionIndex].correctAnswer)}`}
                  </h3>
                  <div className="mt-3">
                    <h4 className="font-semibold mb-1">Giải thích:</h4>
                    <div className="prose max-w-none text-sm math-content">
                      <div dangerouslySetInnerHTML={{ __html: processMathContent(questions[currentQuestionIndex].explanation) }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Nút kiểm tra và điều hướng */}
            <div className="flex justify-between">
              <button
                className="bg-blue-200 text-blue-800 px-4 py-2 rounded hover:bg-blue-300 disabled:opacity-50"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || loading}
              >
                Câu trước
              </button>
              
              <div className="flex space-x-2">
                {!submittedAnswer ? (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleSubmitAnswer}
                    disabled={loading || selectedOption === null}
                  >
                    Kiểm tra
                  </button>
                ) : (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Câu tiếp theo
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Hiển thị tiến độ */}
        {questions.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between mb-1 text-sm text-gray-600">
              <span>Tiến độ</span>
              <span>{userAnswers.length}/{questions.length} câu hỏi</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(userAnswers.length / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Thêm khai báo global cho TypeScript
declare global {
  interface Window {
    MathJax: any;
  }
} 