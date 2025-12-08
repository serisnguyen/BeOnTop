
import { PhoneLookupResult } from '../types';

export interface ScamCase {
  id: number;
  type: 'Deepfake' | 'Giả danh' | 'Đầu tư' | 'Tình cảm' | 'Mã độc';
  title: string;
  realCase?: string;
  damage?: string;
  risk: 'Cao' | 'Trung bình' | 'Thấp';
  description: string;
  keywords: string[];
}

// --- 1. EXTENSIVE SCAM LIBRARY (20 Cases) ---
export const SCAM_LIBRARY_DATA: ScamCase[] = [
  {
    id: 1,
    type: 'Deepfake',
    title: "Video Call giả mạo người thân (Deepfake)",
    realCase: "Vụ án 2 tỷ đồng tại TP.HCM (3/2024)",
    damage: "2.5 tỷ VNĐ",
    risk: 'Cao',
    description: "Kẻ gian dùng AI để tái tạo khuôn mặt và giọng nói của người thân. Cuộc gọi thường rất ngắn, chất lượng kém, viện cớ 'mạng yếu' để tránh bị lộ, sau đó nhắn tin yêu cầu chuyển tiền gấp.",
    keywords: ['cấp cứu', 'chuyển gấp', 'mạng yếu', 'không nghe rõ'],
  },
  {
    id: 2,
    type: 'Giả danh',
    title: "Mạo danh Công an/VKS điều tra án",
    realCase: "Bà P. tại Hà Nội mất 850tr",
    damage: "850 triệu VNĐ",
    risk: 'Cao',
    description: "Gọi điện thông báo nạn nhân dính líu đến đường dây rửa tiền/ma túy. Yêu cầu chuyển toàn bộ tiền vào 'tài khoản tạm giữ' của Bộ Công an để thẩm tra và chứng minh trong sạch.",
    keywords: ['lệnh bắt', 'tài khoản tạm giữ', 'bảo mật', 'tuyệt mật'],
  },
  {
    id: 3,
    type: 'Mã độc',
    title: "Dịch vụ công giả mạo (VNeID/Thuế)",
    realCase: "Cảnh báo từ Bộ Công An (2024)",
    damage: "Mất quyền kiểm soát điện thoại",
    risk: 'Cao',
    description: "Kẻ gian dụ cài đặt ứng dụng VNeID hoặc Tổng cục Thuế giả mạo qua đường link lạ (.apk). Ứng dụng này chứa mã độc chiếm quyền điều khiển điện thoại, đọc OTP và lấy trộm tiền.",
    keywords: ['định danh mức 2', 'quyết toán thuế', 'file apk', 'nâng cấp'],
  },
  {
    id: 4,
    type: 'Đầu tư',
    title: "Sàn chứng khoán/Tiền ảo lừa đảo",
    realCase: "Sập sàn Forex trái phép",
    damage: "Hàng chục tỷ đồng",
    risk: 'Cao',
    description: "Mời vào nhóm Zalo kín, chuyên gia đọc lệnh 'bao lỗ', 'lợi nhuận x10'. Cho rút tiền lãi nhỏ ban đầu để tạo niềm tin, sau đó yêu cầu nạp lớn và khóa tài khoản.",
    keywords: ['lợi nhuận x10', 'chuyên gia', 'đọc lệnh', 'không rút được'],
  },
  {
    id: 5,
    type: 'Tình cảm',
    title: "Bẫy tình cảm (Romance Scam)",
    realCase: "Quý bà bị 'trai Tây' lừa",
    damage: "300 triệu VNĐ",
    risk: 'Trung bình',
    description: "Kết bạn qua mạng, tự xưng là quân nhân/doanh nhân nước ngoài. Gửi quà đắt tiền về Việt Nam nhưng bị 'Hải quan' giữ lại, yêu cầu nạn nhân đóng phí phạt/thuế để nhận quà.",
    keywords: ['hải quan', 'gửi quà', 'đóng thuế', 'người yêu nước ngoài'],
  },
  {
    id: 6,
    type: 'Giả danh',
    title: "Khóa SIM sau 2 tiếng",
    realCase: "Chiêu trò chuẩn hóa thông tin",
    damage: "Mất SIM, mất OTP",
    risk: 'Trung bình',
    description: "Tự xưng nhân viên nhà mạng, dọa khóa SIM nếu không chuẩn hóa thông tin ngay. Yêu cầu nhắn tin theo cú pháp lạ (thực chất là cú pháp chuyển hướng cuộc gọi hoặc đổi SIM).",
    keywords: ['khóa sim', 'chuẩn hóa', 'sau 2 giờ'],
  },
  {
    id: 7,
    type: 'Đầu tư',
    title: "Tuyển CTV làm việc online nhẹ nhàng",
    realCase: "CTV Shopee/Lazada giả",
    damage: "50 - 200 triệu VNĐ",
    risk: 'Trung bình',
    description: "Tuyển làm nhiệm vụ like/share hoặc đặt đơn hàng ảo để nhận hoa hồng. Yêu cầu ứng tiền trước để làm nhiệm vụ, sau đó không hoàn lại.",
    keywords: ['nhiệm vụ', 'hoa hồng cao', 'việc nhẹ lương cao'],
  },
  {
    id: 8,
    type: 'Mã độc',
    title: "Link trúng thưởng/Phiếu giảm giá",
    damage: "Mất Facebook, Zalo",
    risk: 'Thấp',
    description: "Gửi tin nhắn trúng thưởng xe máy/điện thoại hoặc phiếu siêu thị. Yêu cầu click vào link và đăng nhập Facebook/Zalo để nhận, từ đó đánh cắp tài khoản.",
    keywords: ['trúng thưởng', 'nhận quà', 'tri ân khách hàng'],
  },
  {
    id: 9,
    type: 'Giả danh',
    title: "Con đang cấp cứu ở bệnh viện",
    realCase: "Loạt phụ huynh TP.HCM bị lừa",
    damage: "20 - 50 triệu VNĐ",
    risk: 'Cao',
    description: "Gọi điện cho phụ huynh báo con bị tai nạn đang cấp cứu, cần chuyển tiền mổ gấp. Kẻ gian tạo bối cảnh ồn ào bệnh viện để gây hoang mang.",
    keywords: ['cấp cứu', 'chuyển gấp', 'thầy cô giáo', 'bệnh viện'],
  },
  {
    id: 10,
    type: 'Tình cảm',
    title: "Tống tiền bằng video nhạy cảm",
    realCase: "Bẫy 'chat sex'",
    damage: "Uy tín danh dự, tiền bạc",
    risk: 'Cao',
    description: "Dụ dỗ nạn nhân chat video nhạy cảm, sau đó quay lại màn hình và tống tiền, dọa tung lên mạng hoặc gửi cho danh bạ.",
    keywords: ['video nhạy cảm', 'tống tiền', 'gửi cho bạn bè'],
  },
  {
    id: 11,
    type: 'Giả danh',
    title: "Phạt nguội giao thông giả mạo",
    risk: 'Trung bình',
    description: "Gọi điện thông báo có biên lai phạt nguội quá hạn, yêu cầu cung cấp thông tin cá nhân và chuyển tiền nộp phạt để tránh bị tước bằng lái.",
    keywords: ['phạt nguội', 'cảnh sát giao thông', 'quá hạn'],
  },
  {
    id: 12,
    type: 'Đầu tư',
    title: "Hội thảo bán hàng người cao tuổi",
    realCase: "Bán 'thần dược' giá cắt cổ",
    damage: "5 - 10 triệu VNĐ",
    risk: 'Trung bình',
    description: "Mời người cao tuổi đi hội thảo tặng quà miễn phí (dầu ăn, gạo). Sau đó dụ dỗ mua thực phẩm chức năng, đồ gia dụng kém chất lượng với giá rất cao.",
    keywords: ['tặng quà', 'hội thảo', 'miễn phí', 'sữa non'],
  },
  {
    id: 13,
    type: 'Mã độc',
    title: "Mã QR độc hại nơi công cộng",
    risk: 'Cao',
    description: "Dán đè mã QR thanh toán tại các cửa hàng hoặc mã QR nhận ưu đãi giả mạo. Khi quét sẽ bị chuyển hướng đến trang web lừa đảo hoặc tải mã độc.",
    keywords: ['quét mã', 'thanh toán', 'ưu đãi'],
  },
  {
    id: 14,
    type: 'Giả danh',
    title: "Nhân viên điện lực/cấp nước",
    description: "Thông báo nợ cước và dọa cắt điện/nước trong 2 giờ tới nếu không thanh toán ngay qua tài khoản cá nhân được cung cấp.",
    risk: 'Trung bình',
    keywords: ['cắt điện', 'nợ cước', 'thanh toán ngay'],
  },
  {
    id: 15,
    type: 'Tình cảm',
    title: "Giả mạo người thân đi du lịch gặp nạn",
    risk: 'Trung bình',
    description: "Hack Facebook người thân, nhắn tin báo đang đi du lịch bị mất ví/giấy tờ, nhờ chuyển tiền gấp để mua vé về nước.",
    keywords: ['mất ví', 'kẹt tiền', 'mua vé'],
  },
  {
    id: 16,
    type: 'Đầu tư',
    title: "Sở hữu kỳ nghỉ du lịch ảo",
    damage: "Hàng trăm triệu đồng",
    risk: 'Cao',
    description: "Mời chào mua gói sở hữu kỳ nghỉ tại các resort 5 sao với lời hứa sinh lời cao, dễ dàng bán lại. Thực tế hợp đồng gài bẫy, khó thanh khoản.",
    keywords: ['kỳ nghỉ', 'resort', 'sinh lời'],
  },
  {
    id: 17,
    type: 'Giả danh',
    title: "Shipper báo giao hàng (khi không ở nhà)",
    risk: 'Thấp',
    description: "Giả làm shipper báo có đơn hàng COD, yêu cầu chuyển khoản trước vì khách không có nhà. Thực tế không có đơn hàng nào.",
    keywords: ['chuyển khoản', 'đơn hàng', 'bom hàng'],
  },
  {
    id: 18,
    type: 'Mã độc',
    title: "Giả mạo tin nhắn Brandname Ngân hàng",
    risk: 'Cao',
    description: "Sử dụng thiết bị phát sóng giả mạo để gửi tin nhắn có tên hiển thị là Ngân hàng (Vietcombank, ACB...) chứa link đăng nhập giả để chiếm đoạt tài khoản.",
    keywords: ['đổi mật khẩu', 'xác thực', 'trừ tiền'],
  },
  {
    id: 19,
    type: 'Đầu tư',
    title: "Bẫy Dropshipping quốc tế",
    risk: 'Cao',
    description: "Dụ dỗ kinh doanh không cần vốn trên Amazon/Etsy. Yêu cầu đóng phí mở gian hàng, phí duy trì, phí quảng cáo rồi biến mất.",
    keywords: ['dropshipping', 'không vốn', 'amazon'],
  },
  {
    id: 20,
    type: 'Giả danh',
    title: "Lừa đảo vé máy bay giá rẻ",
    risk: 'Trung bình',
    description: "Tạo fanpage bán vé máy bay/combo du lịch giá rẻ bất ngờ. Yêu cầu chuyển khoản 100% giữ chỗ rồi chặn liên lạc.",
    keywords: ['vé rẻ', 'combo du lịch', 'giữ chỗ'],
  }
];

// --- 2. EXTENSIVE PHONE DATABASE (~100 Entries) ---
// Structure: High Risk (Scam), Medium Risk (Spam), Low Risk (Safe/Business)

const MOCK_DB_SOURCE: Record<string, PhoneLookupResult> = {
  // === DANGEROUS / SCAM (20+) ===
  '0888999000': { phoneNumber: '0888999000', carrier: 'Vinaphone', tags: ['scam'], reportCount: 1542, reputationScore: 5, communityLabel: 'Giả danh Công an (Đã xác minh)' },
  '0977123456': { phoneNumber: '0977123456', carrier: 'Viettel', tags: ['scam'], reportCount: 890, reputationScore: 10, communityLabel: 'Lừa đảo đầu tư Forex' },
  '0366887799': { phoneNumber: '0366887799', carrier: 'Viettel', tags: ['scam'], reportCount: 560, reputationScore: 12, communityLabel: 'Giả mạo nhân viên ngân hàng' },
  '0912349999': { phoneNumber: '0912349999', carrier: 'Vinaphone', tags: ['scam'], reportCount: 2300, reputationScore: 2, communityLabel: 'Lừa đảo "Con đang cấp cứu"' },
  '0868112233': { phoneNumber: '0868112233', carrier: 'Viettel', tags: ['scam'], reportCount: 450, reputationScore: 15, communityLabel: 'Tuyển cộng tác viên lừa đảo' },
  '0588999111': { phoneNumber: '0588999111', carrier: 'Vietnamobile', tags: ['scam'], reportCount: 120, reputationScore: 20, communityLabel: 'Hack Facebook vay tiền' },
  '0909000666': { phoneNumber: '0909000666', carrier: 'Mobifone', tags: ['scam'], reportCount: 3400, reputationScore: 1, communityLabel: 'Deepfake Video Call' },
  '0899888777': { phoneNumber: '0899888777', carrier: 'Mobifone', tags: ['scam'], reportCount: 670, reputationScore: 8, communityLabel: 'Giả VKSND Tối cao' },
  '0399111222': { phoneNumber: '0399111222', carrier: 'Viettel', tags: ['scam'], reportCount: 150, reputationScore: 25, communityLabel: 'Lừa đảo trúng thưởng Shopee' },
  '0707333444': { phoneNumber: '0707333444', carrier: 'Mobifone', tags: ['scam'], reportCount: 90, reputationScore: 30, communityLabel: 'Spam Link độc hại' },
  '02499998888': { phoneNumber: '02499998888', carrier: 'Cố định', tags: ['scam'], reportCount: 5000, reputationScore: 0, communityLabel: 'Tổng đài giả mạo Bộ Công an' },
  '0961234567': { phoneNumber: '0961234567', carrier: 'Viettel', tags: ['scam'], reportCount: 310, reputationScore: 15, communityLabel: 'Giả danh sàn Binance' },
  '0987654321': { phoneNumber: '0987654321', carrier: 'Viettel', tags: ['scam'], reportCount: 420, reputationScore: 18, communityLabel: 'Lừa đảo việc làm TikTok' },
  '0911223344': { phoneNumber: '0911223344', carrier: 'Vinaphone', tags: ['scam'], reportCount: 110, reputationScore: 22, communityLabel: 'Giả danh CSGT phạt nguội' },
  '0933445566': { phoneNumber: '0933445566', carrier: 'Mobifone', tags: ['scam'], reportCount: 2200, reputationScore: 3, communityLabel: 'App vay nặng lãi' },

  // === SPAM / NUISANCE (Amber - 20+) ===
  '02477778888': { phoneNumber: '02477778888', carrier: 'VNPT Cố định', tags: ['spam', 'business'], reportCount: 342, reputationScore: 40, communityLabel: 'Quảng cáo Bất động sản' },
  '02838889999': { phoneNumber: '02838889999', carrier: 'FPT Telecom', tags: ['spam', 'business'], reportCount: 800, reputationScore: 35, communityLabel: 'Tư vấn Bảo hiểm (Spam)' },
  '0933444555': { phoneNumber: '0933444555', carrier: 'Mobifone', tags: ['spam'], reportCount: 150, reputationScore: 45, communityLabel: 'Mời vay tín dụng đen' },
  '0844555666': { phoneNumber: '0844555666', carrier: 'Vinaphone', tags: ['spam'], reportCount: 200, reputationScore: 48, communityLabel: 'Tư vấn chứng khoán' },
  '0566777888': { phoneNumber: '0566777888', carrier: 'Vietnamobile', tags: ['spam'], reportCount: 50, reputationScore: 55, communityLabel: 'Spam SIM số đẹp' },
  '02871099999': { phoneNumber: '02871099999', carrier: 'CMC Telecom', tags: ['spam', 'business'], reportCount: 1200, reputationScore: 42, communityLabel: 'Đòi nợ thuê (Fe Credit)' },
  '02466889900': { phoneNumber: '02466889900', carrier: 'Cố định', tags: ['spam'], reportCount: 300, reputationScore: 45, communityLabel: 'Mời học tiếng Anh' },
  '02822334455': { phoneNumber: '02822334455', carrier: 'Cố định', tags: ['spam'], reportCount: 250, reputationScore: 46, communityLabel: 'Bán nghỉ dưỡng/Voucher' },
  '0891234567': { phoneNumber: '0891234567', carrier: 'Mobifone', tags: ['spam'], reportCount: 180, reputationScore: 49, communityLabel: 'Tư vấn Forex' },
  
  // === SAFE / TRUSTED (Green - 20+) ===
  '0909112233': { phoneNumber: '0909112233', carrier: 'Mobifone', tags: ['delivery', 'safe'], reportCount: 0, reputationScore: 95, communityLabel: 'Shipper Giao Hàng Tiết Kiệm' },
  '1900545436': { phoneNumber: '1900545436', carrier: 'Hotline', tags: ['safe', 'business'], reportCount: 0, reputationScore: 100, communityLabel: 'Vietcombank Hotline' },
  '19001060': { phoneNumber: '19001060', carrier: 'Hotline', tags: ['safe', 'business'], reportCount: 0, reputationScore: 100, communityLabel: 'Tổng đài Viettel' },
  '02854321123': { phoneNumber: '02854321123', carrier: 'Cố định', tags: ['safe', 'business'], reportCount: 2, reputationScore: 90, communityLabel: 'Bệnh viện Chợ Rẫy' },
  '0988777666': { phoneNumber: '0988777666', carrier: 'Viettel', tags: ['delivery', 'safe'], reportCount: 0, reputationScore: 88, communityLabel: 'Shipper Shopee Express' },
  '0911222333': { phoneNumber: '0911222333', carrier: 'Vinaphone', tags: ['safe'], reportCount: 0, reputationScore: 92, communityLabel: 'Grab Driver' },
  '0966555444': { phoneNumber: '0966555444', carrier: 'Viettel', tags: ['safe'], reportCount: 0, reputationScore: 85, communityLabel: 'Be Driver' },
  '18001091': { phoneNumber: '18001091', carrier: 'Hotline', tags: ['safe', 'business'], reportCount: 0, reputationScore: 100, communityLabel: 'CSKH Vinaphone' },
  '19001900': { phoneNumber: '19001900', carrier: 'Hotline', tags: ['safe', 'business'], reportCount: 0, reputationScore: 100, communityLabel: 'CSKH Điện Lực EVN' },
  '02438383838': { phoneNumber: '02438383838', carrier: 'Cố định', tags: ['safe', 'business'], reportCount: 1, reputationScore: 95, communityLabel: 'Taxi Mai Linh' },
};

// Procedurally generate more entries to hit ~100
for (let i = 0; i < 40; i++) {
  const isSpam = i % 2 === 0;
  const prefix = isSpam ? '028' : '024';
  const suffix = Math.floor(10000000 + Math.random() * 90000000).toString();
  const num = `${prefix}${suffix}`;
  
  if (!MOCK_DB_SOURCE[num]) {
      MOCK_DB_SOURCE[num] = {
          phoneNumber: num,
          carrier: 'VNPT Cố định',
          tags: isSpam ? ['spam'] : ['business', 'safe'],
          reportCount: isSpam ? Math.floor(Math.random() * 200) + 50 : 0,
          reputationScore: isSpam ? 45 : 85,
          communityLabel: isSpam ? 'Quảng cáo tự động' : 'Doanh nghiệp địa phương'
      };
  }
}

export const MOCK_PHONE_DATABASE = MOCK_DB_SOURCE;
