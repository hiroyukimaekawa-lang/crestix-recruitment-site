tailwind.config = {
    theme: {
        extend: {
            colors: {
                crestix: {
                    orange: '#FF5C00',       // アクセントカラー (5%)
                    orangeDark: '#E65200',   // グラデーション用
                    orangeLight: '#FFF5EE',  // 診断背景・サブ
                    charcoal: '#333333',     // サブカラー (25%)
                    navy: '#1A2B4C',         // フッター・重厚感
                    bgLight: '#F7F9FA',      // ベースカラー (70%)
                    white: '#FFFFFF',
                    border: '#E5E7EB',
                    textDim: '#6B7280',
                }
            },
            fontFamily: {
                sans: ['Noto Sans JP', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif']
            },
            boxShadow: {
                'orange-glow': '0 10px 25px -5px rgba(255, 92, 0, 0.25), 0 8px 10px -6px rgba(255, 92, 0, 0.1)',
                'soft-float': '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
                '3d-depth': '0 30px 60px -12px rgba(0, 0, 0, 0.45)',
            }
        }
    }
}
