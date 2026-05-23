/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        beige: '#EDE8DF',
        cream: '#FAF7F2',
        'rich-black': '#0B0A09',
        'burn-orange': '#C84B0F',
        amber: '#F5B730',
        charcoal: '#1C1917',
        'warm-gray': '#78716C',
        'deep-charcoal': '#292524',
        naver: '#03C75A',
        kakao: '#FEE500',
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 1.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
