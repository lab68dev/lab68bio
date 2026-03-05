"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/* -------------------------------------------------------------------------- */
/*  TYPES                                                                     */
/* -------------------------------------------------------------------------- */

export type Lang = "en" | "vi";

interface TranslationItem {
  title: string;
  desc: string;
}

interface PricingTier {
  name: string;
  desc: string;
  features: string[];
  cta: string;
}

interface FooterColumn {
  heading: string;
  links: string[];
}

export interface Translations {
  nav: {
    features: string;
    templates: string;
    showcase: string;
    pricing: string;
    docs: string;
    getStarted: string;
  };
  hero: {
    overline: string;
    headline1: string;
    headline2: string;
    desc: string;
    startBuilding: string;
    seeExamples: string;
  };
  stats: {
    creators: string;
    components: string;
    pagesBuilt: string;
    uptime: string;
  };
  hud: {
    dragDrop: string;
    componentsReady: string;
    customThemes: string;
    unlimitedStyles: string;
    yourLink: string;
    publish: string;
    oneClickLive: string;
  };
  features: {
    overline: string;
    title: string;
    subtitle: string;
    items: TranslationItem[];
  };
  howItWorks: {
    overline: string;
    title: string;
    steps: TranslationItem[];
  };
  showcase: {
    overline: string;
    title: string;
    subtitle: string;
  };
  pricing: {
    overline: string;
    title: string;
    subtitle: string;
    mostPopular: string;
    redirecting: string;
    tiers: PricingTier[];
  };
  cta: {
    overline: string;
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    brandDesc: string;
    tagline: string;
    columns: FooterColumn[];
  };
  login: {
    title: string;
    email: string;
    password: string;
    submit: string;
    loading: string;
    noAccount: string;
  };
  register: {
    title: string;
    subtitle: string;
    username: string;
    email: string;
    password: string;
    submit: string;
    loading: string;
    hasAccount: string;
  };
  common: {
    networkError: string;
    showPassword: string;
    hidePassword: string;
  };
}

/* -------------------------------------------------------------------------- */
/*  ENGLISH                                                                   */
/* -------------------------------------------------------------------------- */

const en: Translations = {
  nav: {
    features: "Features",
    templates: "Templates",
    showcase: "Showcase",
    pricing: "Pricing",
    docs: "Docs",
    getStarted: "Get Started",
  },
  hero: {
    overline: "// YOUR LINK. YOUR STORY. YOUR PORTFOLIO.",
    headline1: "Build your bio.",
    headline2: "Share your portfolio. Instantly.",
    desc: "Drag-and-drop components to craft a stunning bio and portfolio page in minutes. Claim your unique username.bio.lab68 link and showcase your work, skills, and social presence — no coding required. Beautiful by default, fully customizable.",
    startBuilding: "Start Building",
    seeExamples: "See Examples",
  },
  stats: {
    creators: "CREATORS",
    components: "COMPONENTS",
    pagesBuilt: "PAGES BUILT",
    uptime: "UPTIME",
  },
  hud: {
    dragDrop: "DRAG & DROP",
    componentsReady: "COMPONENTS // READY",
    customThemes: "CUSTOM THEMES",
    unlimitedStyles: "UNLIMITED // STYLES",
    yourLink: "YOUR LINK",
    publish: "PUBLISH",
    oneClickLive: "ONE CLICK // LIVE",
  },
  features: {
    overline: "// WHAT YOU GET",
    title: "Everything you need. Nothing you don\u2019t.",
    subtitle:
      "Powerful building blocks designed to make your bio and portfolio page stand out — all wrapped in an interface that feels effortless.",
    items: [
      {
        title: "Drag & Drop Builder",
        desc: "Snap components into place with an intuitive visual editor. No code, no fuss — just drag, drop, done.",
      },
      {
        title: "Your Unique Link",
        desc: "Claim username.bio.lab68 and own a permanent home on the internet your audience can always find.",
      },
      {
        title: "9+ Modular Blocks",
        desc: "Hero banners, about sections, portfolios, skill bars, contact forms — mix and match to tell your story.",
      },
      {
        title: "One-Click Publish",
        desc: "Hit publish and your page goes live instantly. Update anytime — changes deploy in milliseconds.",
      },
      {
        title: "Mobile-First Responsive",
        desc: "Every page looks stunning on every screen. Zero configuration, automatic adaptive layouts.",
      },
      {
        title: "Endlessly Customizable",
        desc: "Fine-tune colors, fonts, spacing, and layout. Make it unmistakably yours with total creative control.",
      },
    ],
  },
  howItWorks: {
    overline: "// HOW IT WORKS",
    title: "Three steps. Zero friction.",
    steps: [
      {
        title: "Create Your Account",
        desc: "Sign up in seconds. Choose a username — that becomes your permanent link: username.bio.lab68.",
      },
      {
        title: "Design Your Page",
        desc: "Open the visual editor. Drag blocks onto your canvas, customize content, rearrange until it\u2019s perfect.",
      },
      {
        title: "Publish & Share",
        desc: "One click to go live. Share your link anywhere — social bios, email signatures, business cards.",
      },
    ],
  },
  showcase: {
    overline: "// REAL PEOPLE. REAL PAGES.",
    title: "See what others are building.",
    subtitle:
      "Designers, developers, creators, freelancers — everyone\u2019s building their corner of the internet with lab68bio.",
  },
  pricing: {
    overline: "// SIMPLE PRICING",
    title: "Start free. Scale when ready.",
    subtitle:
      "No hidden fees. No credit card required. Build your page today and upgrade only when you need more.",
    mostPopular: "MOST POPULAR",
    redirecting: "REDIRECTING...",
    tiers: [
      {
        name: "Starter",
        desc: "Everything you need to get started with your bio page.",
        features: [
          "1 published page",
          "All 9 block types",
          "username.bio.lab68 link",
          "Drag & drop editor",
          "Mobile responsive",
        ],
        cta: "Start Free",
      },
      {
        name: "Pro",
        desc: "For creators and professionals who want to stand out.",
        features: [
          "Unlimited pages",
          "Custom themes & fonts",
          "Analytics dashboard",
          "Priority support",
          "Remove lab68 branding",
          "Custom CSS injection",
        ],
        cta: "Go Pro",
      },
      {
        name: "Team",
        desc: "For agencies and teams managing multiple identities.",
        features: [
          "Everything in Pro",
          "5 team members",
          "Shared template library",
          "Bulk page management",
          "API access",
          "Dedicated account manager",
        ],
        cta: "Contact Sales",
      },
    ],
  },
  cta: {
    overline: "// READY TO BUILD?",
    title: "Your internet identity starts here.",
    subtitle:
      "Join thousands of creators, developers, and professionals who use lab68bio to showcase their work. Free forever — no strings attached.",
    button: "Create Your Page",
  },
  footer: {
    brandDesc:
      "The simplest way to build and share your bio & portfolio page. Free, fast, and beautifully engineered.",
    tagline: "Engineered with precision.",
    columns: [
      {
        heading: "Product",
        links: ["Features", "Templates", "Pricing", "Changelog", "Roadmap"],
      },
      {
        heading: "Resources",
        links: [
          "Documentation",
          "API Reference",
          "Blog",
          "Community",
          "Support",
        ],
      },
      {
        heading: "Company",
        links: [
          "About",
          "Careers",
          "Brand",
          "Privacy Policy",
          "Terms of Service",
        ],
      },
    ],
  },
  login: {
    title: "SIGN IN",
    email: "EMAIL",
    password: "PASSWORD",
    submit: "SIGN IN",
    loading: "SIGNING IN...",
    noAccount: "DON\u2019T HAVE AN ACCOUNT? // REGISTER",
  },
  register: {
    title: "CREATE ACCOUNT",
    subtitle: "// CLAIM YOUR USERNAME.BIO.LAB68",
    username: "USERNAME",
    email: "EMAIL",
    password: "PASSWORD",
    submit: "CREATE ACCOUNT",
    loading: "CREATING...",
    hasAccount: "ALREADY HAVE AN ACCOUNT? // SIGN IN",
  },
  common: {
    networkError: "Network error. Please try again.",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
};

/* -------------------------------------------------------------------------- */
/*  VIETNAMESE                                                                */
/* -------------------------------------------------------------------------- */

const vi: Translations = {
  nav: {
    features: "Tính năng",
    templates: "Mẫu",
    showcase: "Trưng bày",
    pricing: "Bảng giá",
    docs: "Tài liệu",
    getStarted: "Bắt đầu",
  },
  hero: {
    overline: "// LIÊN KẾT. CÂU CHUYỆN. HỒ SƠ CỦA BẠN.",
    headline1: "Xây dựng trang cá nhân.",
    headline2: "Chia sẻ portfolio. Ngay lập tức.",
    desc: "Kéo và thả các thành phần để tạo trang giới thiệu và portfolio ấn tượng chỉ trong vài phút. Sở hữu đường dẫn username.bio.lab68 duy nhất và giới thiệu công việc, kỹ năng, mạng xã hội của bạn — không cần lập trình. Đẹp mặc định, tùy chỉnh hoàn toàn.",
    startBuilding: "Bắt đầu xây dựng",
    seeExamples: "Xem ví dụ",
  },
  stats: {
    creators: "NGƯỜI DÙNG",
    components: "THÀNH PHẦN",
    pagesBuilt: "TRANG ĐÃ TẠO",
    uptime: "HOẠT ĐỘNG",
  },
  hud: {
    dragDrop: "KÉO & THẢ",
    componentsReady: "THÀNH PHẦN // SẴN SÀNG",
    customThemes: "CHỦ ĐỀ TÙY CHỈNH",
    unlimitedStyles: "KHÔNG GIỚI HẠN // PHONG CÁCH",
    yourLink: "LIÊN KẾT",
    publish: "XUẤT BẢN",
    oneClickLive: "MỘT CLICK // TRỰC TIẾP",
  },
  features: {
    overline: "// BẠN NHẬN ĐƯỢC GÌ",
    title: "Mọi thứ bạn cần. Không có gì thừa.",
    subtitle:
      "Các khối xây dựng mạnh mẽ giúp trang cá nhân và portfolio của bạn nổi bật — tất cả trong giao diện dễ sử dụng.",
    items: [
      {
        title: "Trình kéo & thả",
        desc: "Ghép các thành phần vào vị trí với trình chỉnh sửa trực quan. Không cần code, không phức tạp — chỉ cần kéo, thả, xong.",
      },
      {
        title: "Đường dẫn riêng",
        desc: "Sở hữu username.bio.lab68 và có một ngôi nhà cố định trên internet mà khán giả luôn tìm thấy.",
      },
      {
        title: "9+ khối mô-đun",
        desc: "Banner chính, giới thiệu, portfolio, thanh kỹ năng, form liên hệ — kết hợp tùy ý để kể câu chuyện của bạn.",
      },
      {
        title: "Xuất bản một click",
        desc: "Nhấn xuất bản và trang đi live ngay. Cập nhật bất cứ lúc nào — thay đổi triển khai trong mili giây.",
      },
      {
        title: "Ưu tiên di động",
        desc: "Mọi trang đều đẹp trên mọi màn hình. Không cần cấu hình, bố cục tự động thích ứng.",
      },
      {
        title: "Tùy chỉnh vô tận",
        desc: "Tinh chỉnh màu sắc, font chữ, khoảng cách và bố cục. Biến nó thành phong cách riêng của bạn.",
      },
    ],
  },
  howItWorks: {
    overline: "// CÁCH HOẠT ĐỘNG",
    title: "Ba bước. Không rào cản.",
    steps: [
      {
        title: "Tạo tài khoản",
        desc: "Đăng ký trong vài giây. Chọn username — đó trở thành đường dẫn cố định: username.bio.lab68.",
      },
      {
        title: "Thiết kế trang",
        desc: "Mở trình chỉnh sửa. Kéo các khối vào canvas, tùy chỉnh nội dung, sắp xếp cho đến khi hoàn hảo.",
      },
      {
        title: "Xuất bản & chia sẻ",
        desc: "Một click để đi live. Chia sẻ đường dẫn ở bất cứ đâu — bio mạng xã hội, chữ ký email, danh thiếp.",
      },
    ],
  },
  showcase: {
    overline: "// NGƯỜI THẬT. TRANG THẬT.",
    title: "Xem người khác đang xây dựng gì.",
    subtitle:
      "Nhà thiết kế, lập trình viên, nhà sáng tạo, freelancer — mọi người đều đang xây dựng góc riêng trên internet với lab68bio.",
  },
  pricing: {
    overline: "// GIÁ CẢ ĐƠN GIẢN",
    title: "Bắt đầu miễn phí. Nâng cấp khi sẵn sàng.",
    subtitle:
      "Không phí ẩn. Không cần thẻ tín dụng. Xây dựng trang ngay hôm nay và nâng cấp chỉ khi cần.",
    mostPopular: "PHỔ BIẾN NHẤT",
    redirecting: "ĐANG CHUYỂN HƯỚNG...",
    tiers: [
      {
        name: "Starter",
        desc: "Mọi thứ bạn cần để bắt đầu với trang cá nhân.",
        features: [
          "1 trang đã xuất bản",
          "Tất cả 9 loại khối",
          "Đường dẫn username.bio.lab68",
          "Trình kéo & thả",
          "Giao diện di động",
        ],
        cta: "Dùng miễn phí",
      },
      {
        name: "Pro",
        desc: "Cho người sáng tạo và chuyên gia muốn nổi bật.",
        features: [
          "Không giới hạn trang",
          "Chủ đề & font tùy chỉnh",
          "Bảng phân tích",
          "Hỗ trợ ưu tiên",
          "Xóa thương hiệu lab68",
          "Chèn CSS tùy chỉnh",
        ],
        cta: "Dùng Pro",
      },
      {
        name: "Team",
        desc: "Cho agency và nhóm quản lý nhiều danh tính.",
        features: [
          "Tất cả trong Pro",
          "5 thành viên nhóm",
          "Thư viện mẫu chung",
          "Quản lý trang hàng loạt",
          "Truy cập API",
          "Quản lý tài khoản riêng",
        ],
        cta: "Liên hệ",
      },
    ],
  },
  cta: {
    overline: "// SẴN SÀNG XÂY DỰNG?",
    title: "Danh tính internet của bạn bắt đầu từ đây.",
    subtitle:
      "Tham gia cùng hàng nghìn người sáng tạo, lập trình viên và chuyên gia sử dụng lab68bio để giới thiệu công việc. Miễn phí mãi mãi — không ràng buộc.",
    button: "Tạo trang của bạn",
  },
  footer: {
    brandDesc:
      "Cách đơn giản nhất để xây dựng và chia sẻ trang cá nhân & portfolio. Miễn phí, nhanh và được thiết kế tinh tế.",
    tagline: "Được xây dựng với sự chính xác.",
    columns: [
      {
        heading: "Sản phẩm",
        links: ["Tính năng", "Mẫu", "Bảng giá", "Nhật ký", "Lộ trình"],
      },
      {
        heading: "Tài nguyên",
        links: [
          "Tài liệu",
          "Tham chiếu API",
          "Blog",
          "Cộng đồng",
          "Hỗ trợ",
        ],
      },
      {
        heading: "Công ty",
        links: [
          "Giới thiệu",
          "Tuyển dụng",
          "Thương hiệu",
          "Chính sách bảo mật",
          "Điều khoản dịch vụ",
        ],
      },
    ],
  },
  login: {
    title: "ĐĂNG NHẬP",
    email: "EMAIL",
    password: "MẬT KHẨU",
    submit: "ĐĂNG NHẬP",
    loading: "ĐANG ĐĂNG NHẬP...",
    noAccount: "CHƯA CÓ TÀI KHOẢN? // ĐĂNG KÝ",
  },
  register: {
    title: "TẠO TÀI KHOẢN",
    subtitle: "// SỞ HỮU USERNAME.BIO.LAB68",
    username: "TÊN NGƯỜI DÙNG",
    email: "EMAIL",
    password: "MẬT KHẨU",
    submit: "TẠO TÀI KHOẢN",
    loading: "ĐANG TẠO...",
    hasAccount: "ĐÃ CÓ TÀI KHOẢN? // ĐĂNG NHẬP",
  },
  common: {
    networkError: "Lỗi mạng. Vui lòng thử lại.",
    showPassword: "Hiện mật khẩu",
    hidePassword: "Ẩn mật khẩu",
  },
};

/* -------------------------------------------------------------------------- */
/*  DICTIONARY                                                                */
/* -------------------------------------------------------------------------- */

const dictionaries: Record<Lang, Translations> = { en, vi };

/* -------------------------------------------------------------------------- */
/*  CONTEXT                                                                   */
/* -------------------------------------------------------------------------- */

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lab68bio-lang") as Lang | null;
    if (stored === "en" || stored === "vi") {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lab68bio-lang", l);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
