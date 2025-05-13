import { openRouterApiKey, openRouterBaseUrl, siteInfo } from '@/config/api-keys';

const INFO_THEORY_SAMPLE = `
Lý thuyết thông tin (Information Theory) là ngành khoa học nghiên cứu về lượng hóa, lưu trữ và truyền thông tin. 

Entropy là khái niệm quan trọng nhất trong Lý thuyết Thông tin, đo lường mức độ không chắc chắn của một biến ngẫu nhiên. Entropy được tính bằng công thức H(X) = -Σ p(x) log₂ p(x), trong đó p(x) là xác suất của biến x.

Mã hóa nguồn (Source coding) là quá trình nén dữ liệu để giảm kích thước mà không làm mất thông tin (nén không tổn hại) hoặc mất ít thông tin nhất có thể (nén có tổn hại).

Kênh truyền (Channel) là phương tiện mà thông tin được truyền đi, có thể bị ảnh hưởng bởi nhiễu. Dung lượng kênh truyền (Channel capacity) là tốc độ tối đa mà thông tin có thể được truyền qua kênh một cách đáng tin cậy.

Lý thuyết mã hóa kênh (Channel coding) nghiên cứu cách truyền dữ liệu qua kênh nhiễu sao cho người nhận vẫn có thể khôi phục chính xác thông điệp gốc.
`;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DocumentInfo {
  id: string;
  name: string;
  type: 'preloaded' | 'user-uploaded';
  pageCount?: number;
}

interface OpenRouterCompletionParams {
  messages: Message[];
  model: string;
  stream: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  response_format?: any;
  seed?: number;
  site_info?: {
    site_url?: string;
    site_name?: string;
  }
}

const availableModels = [
  "qwen/qwen3-4b:free",
  "google/gemma-1.1-7b-it:free",
  "mistralai/mistral-7b-instruct:free",
  "openchat/openchat-7b:free",
  "anthropic/claude-instant-1.2:free",
];

export class OpenRouterAPIService {
  private apiKey: string;
  private baseUrl: string;
  private currentModelIndex: number = 0;
  
  constructor() {
    this.apiKey = openRouterApiKey;
    this.baseUrl = openRouterBaseUrl;
    
    // Validate API key format
    if (!this.apiKey.startsWith('sk-or-v1-')) {
      console.warn('Warning: API key does not follow expected format (should start with sk-or-v1-)');
    }
  }
  
  private getDefaultParams(): OpenRouterCompletionParams {
    return {
      messages: [],
      model: availableModels[this.currentModelIndex],
      stream: true,
      max_tokens: 2048, 
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
      site_info: {
        site_url: siteInfo.siteUrl || '',
        site_name: siteInfo.siteName || ''
      }
    };
  }
  
  // Try to generate with the current model, falling back to other models if needed
  private async tryGenerateWithFallback(
    messages: Message[], 
    onToken?: (token: string) => void
  ): Promise<string> {
    const maxRetries = availableModels.length;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Update the model to the current fallback option
        const params = this.getDefaultParams();
        params.messages = messages;
        params.model = availableModels[this.currentModelIndex];
        
        // Log which model we're trying

        
        // Handle streaming if a callback is provided
        if (onToken) {
          return await this.handleStreamingRequest(params, onToken);
        } else {
          return await this.handleNonStreamingRequest(params);
        }
      } catch (error) {
        console.warn(`Error with model ${availableModels[this.currentModelIndex]}:`, error);
        
        // Move to the next model
        this.currentModelIndex = (this.currentModelIndex + 1) % availableModels.length;
        
        // If this was our last attempt, rethrow the error
        if (attempt === maxRetries - 1) {
          throw error;
        }
      }
    }
    
    // This should never happen due to the error throw above, but TypeScript needs a return
    throw new Error("All model attempts failed");
  }
  
  async generateResponse(
    userMessage: string, 
    context?: string,
    onToken?: (token: string) => void,
    documentInfo?: DocumentInfo[]
  ): Promise<string> {
      try {
        const messages: Message[] = [];
        
        // Add system message with context if provided
        if (context && context.trim().length > 0) {
          // Trim context if it's too long to avoid token limits
          let trimmedContext = context;
          if (context.length > 10000) {
            trimmedContext = context.substring(0, 10000) + "...";
          }
          
          // Create a formatted document list for the system prompt
          let documentList = '';
          if (documentInfo && documentInfo.length > 0) {
            documentList = 'Tài liệu đang được sử dụng:\n';
            documentInfo.forEach((doc, index) => {
              documentList += `${index + 1}. "${doc.name}" (${doc.type === 'preloaded' ? 'Tài liệu có sẵn' : 'Tài liệu người dùng tải lên'}, ${doc.pageCount || '?'} trang)\n`;
            });
          }
          
          messages.push({
            role: 'system',
            content: `Bạn là một trợ lý thông minh chuyên về Lý thuyết Thông tin, được tích hợp khả năng đọc tài liệu.
            Hãy trả lời câu hỏi bằng tiếng Việt một cách chính xác và chi tiết, dựa vào nội dung tài liệu người dùng đã chọn.
            
            ${documentList}
            
            Dưới đây là nội dung liên quan đến câu hỏi từ các tài liệu được chọn:
            
            ----------
            ${trimmedContext}
            ----------
            
            Hãy sử dụng thông tin từ tài liệu trên để trả lời câu hỏi. Nếu tài liệu không chứa thông tin cần thiết, hãy sử dụng kiến thức của bạn về Lý thuyết Thông tin để trả lời.
            
            Khi trả lời, hãy chỉ ra thông tin được lấy từ tài liệu nào cụ thể bằng cách sử dụng cú pháp: "Theo tài liệu [tên tài liệu]: ...".
            
            Nếu người dùng hỏi về một tài liệu cụ thể, hãy tập trung vào nội dung từ tài liệu đó. Nếu không rõ người dùng đang hỏi về tài liệu nào, hãy sử dụng thông tin từ tất cả các tài liệu được chọn.
            
            Nếu bạn không biết câu trả lời, hãy thành thật nói rằng thông tin không có trong tài liệu và bạn không biết câu trả lời chính xác.
            
            Hỗ trợ hiển thị công thức toán học với cú pháp: 
            - Sử dụng $...$ cho công thức inline
            - Sử dụng $$...$$ cho công thức block
            
            Ví dụ: Entropy được tính bằng công thức $H(X) = -\\sum_{i} p(x_i) \\log_2 p(x_i)$`
          });
        } else {
          messages.push({
            role: 'system',
            content: `Bạn là một trợ lý thông minh chuyên về Lý thuyết Thông tin, nhưng bạn cũng có thể trả lời các câu hỏi chung. 
            Hãy trả lời câu hỏi bằng tiếng Việt một cách chính xác và chi tiết.
            
            Hiện tại không có tài liệu nào được chọn. Bạn sẽ trả lời dựa vào kiến thức sẵn có.
            
            Nếu câu hỏi là về Lý thuyết Thông tin, dưới đây là một số thông tin cơ bản mà bạn có thể tham khảo:
            ${INFO_THEORY_SAMPLE}
            
            Hỗ trợ hiển thị công thức toán học với cú pháp: 
            - Sử dụng $...$ cho công thức inline
            - Sử dụng $$...$$ cho công thức block
            
            Ví dụ: Entropy được tính bằng công thức $H(X) = -\\sum_{i} p(x_i) \\log_2 p(x_i)$
            
            Nếu bạn không biết câu trả lời, hãy thành thật nói rằng bạn không biết thay vì tạo ra thông tin sai lệch.`
          });
        }
        
        // Add user message
        messages.push({
          role: 'user',
          content: userMessage
        });
        
        // Try with current model, with fallback logic
        return await this.tryGenerateWithFallback(messages, onToken);
        
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  }
  
  // Handle non-streaming request (for models that don't support streaming)
  private async handleNonStreamingRequest(payload: OpenRouterCompletionParams): Promise<string> {
    // Convert from streaming to non-streaming
    const nonStreamingPayload = { ...payload, stream: false };
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(nonStreamingPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API responded with error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
  
  // Handle streaming request
  private async handleStreamingRequest(payload: OpenRouterCompletionParams, onToken: (token: string) => void): Promise<string> {
    let response;
    let fullText = '';
    
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(payload)
        });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API responded with error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorText}`);
      }
    } catch (fetchError: any) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Lỗi kết nối: ${fetchError?.message || 'Unknown error'}`);
    }
    
    // Đảm bảo response là một stream
    if (!response.body) {
      console.error('Response body is null!');
      throw new Error('Không thể đọc phản hồi từ API');
    }
    
    // Khởi tạo trình đọc stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    
    // Đọc các phần của stream
    let done = false;
    let buffer = '';
    
    try {
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (done) {
          break;
        }
        
        // Giải mã phần dữ liệu vừa đọc
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Xử lý từng dòng trong buffer
        while (buffer.includes('\n')) {
          const lineEnd = buffer.indexOf('\n');
          const line = buffer.substring(0, lineEnd).trim();
          buffer = buffer.substring(lineEnd + 1);
          
          // Bỏ qua dòng trống
          if (!line) continue;
          
          // Xử lý dòng dữ liệu từ Server-Sent Events
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            
            // Trường hợp "[DONE]" đánh dấu kết thúc stream
            if (data === '[DONE]') {
              done = true;
              break;
            }
            
            // Phân tích dữ liệu JSON
            try {
              const parsedData = JSON.parse(data);
              const content = parsedData.choices[0]?.delta?.content || '';
              
              if (content) {
                // Thêm vào văn bản hoàn chỉnh
                fullText += content;
                
                // Gọi callback với nội dung mới
                onToken(content);
              }
            } catch (parseError) {
              console.warn('Error parsing SSE data:', parseError);
              // Bỏ qua lỗi phân tích và tiếp tục
            }
          }
        }
      }
    } catch (streamError: any) {
      console.error('Error reading stream:', streamError);
      throw new Error(`Lỗi đọc dữ liệu: ${streamError?.message || 'Unknown error'}`);
    } finally {
      // Đảm bảo reader được release
      if (!done) {
        await reader.cancel();
      }
    }
    
    return fullText;
  }
} 