import { useEffect, useState, useRef, useCallback, memo } from 'react'
import PasswordGate from '../../components/PasswordGate'
import './IosCart.css'

const PW_HASH = 'd2760672c3010d591b868dfcc99e8690a6448c6ee992ae07df0325eb20b9d685'

/* ── tiny inline SVG icons ── */
const IconMinus = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconPlus = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 7v8M7 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconTrash = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3.5 5.5h13M7.5 5.5V4a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 12.5 4v1.5M5.5 5.5l.5 11a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5l.5-11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L1 14h14L8 1.5z" stroke="#c0392b" strokeWidth="1.2" fill="none" />
    <path d="M8 6v4" stroke="#c0392b" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="8" cy="12" r=".7" fill="#c0392b" />
  </svg>
)
const IconHome = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V19a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V9.5" />
  </svg>
)
const IconCart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
)
const IconProfile = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-1a6 6 0 0112 0v1" />
  </svg>
)

/* ── status-bar icons ── */
const SignalIcon = () => (
  <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
    <rect x="0" y="9" width="3" height="3" rx="0.5" />
    <rect x="4.5" y="6" width="3" height="6" rx="0.5" />
    <rect x="9" y="3" width="3" height="9" rx="0.5" />
    <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
  </svg>
)
const WifiIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
    <path d="M8 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM4.5 8.5a5 5 0 017 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M1.5 5.5a9 9 0 0113 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const BatteryIcon = () => (
  <svg width="27" height="13" viewBox="0 0 27 13" fill="currentColor">
    <rect x="0.5" y="0.5" width="23" height="12" rx="2.5" stroke="currentColor" fill="none" strokeWidth="1" opacity="0.4" />
    <rect x="2" y="2" width="20" height="9" rx="1.5" />
    <path d="M25 4.5v4a1.5 1.5 0 000-4z" opacity="0.4" />
  </svg>
)

/* ── "Built with Claude Code" badge ── */
const ClaudeBadge = () => (
  <svg width="209" height="99" viewBox="0 0 209 99" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.9321 29.9287C16.5611 30.7662 16.9115 32.2215 18.9898 39.2598C19.5508 41.2872 19.9195 42.9524 20.5491 44.7472C21.1788 46.5419 22.0582 48.4159 22.8491 50.833" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12.6157 30.7686C12.8452 30.6938 17.2543 30.0185 24.7547 28.7698C30.0212 27.8929 32.5099 26.9356 33.1351 26.9454C33.4589 26.9504 29.5992 29.4822 24.4733 32.7466C20.2081 35.4629 18.8607 38.3265 18.5961 38.9621C18.3773 39.4879 20.3745 38.9498 25.7197 37.6431C32.4287 36.0028 36.7535 35.677 37.1355 35.6764C37.2822 35.6761 36.7617 36.2681 35.2028 37.6096C33.6439 38.9512 30.9163 41.1758 26.8966 43.5031C22.8769 45.8303 17.6478 48.1929 12.0308 50.7754" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M36.5864 28.6396C37.7645 30.2234 40.3619 34.2441 42.3418 36.2767C44.384 38.3733 46.5105 39.1368 47.268 39.1106C49.1816 39.0444 50.4542 36.1286 51.8887 32.4747C52.1337 31.7395 52.1917 31.4291 52.006 29.4302C51.8203 27.4314 51.3891 23.7533 51.1587 19.9365" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M56.1782 20.7041C56.1976 20.8594 56.4724 23.0264 56.9768 26.4459C57.2162 27.7783 57.4221 28.293 57.6826 28.8648C57.943 29.4365 58.2517 30.0498 58.7661 31.3984" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M61.3979 19.5117C61.7375 20.0827 62.4983 21.7228 63.748 28.1669C64.014 29.539 63.9868 29.8318 64.1589 29.9375C65.6333 29.591 69.975 27.989 74.8357 26.3446C76.5883 25.7337 76.8909 25.5767 77.2026 25.415" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M72.146 16.7666C72.1531 16.7666 72.1602 16.7666 73.6815 16.3543C75.2029 15.9419 78.2383 15.1172 80.3504 14.617C82.4624 14.1168 83.5591 13.9659 85.2261 13.6982" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M79.8159 15.085C79.8662 15.2706 80.0268 16.1967 80.4135 17.9403C81.0305 19.8241 81.6362 22.2976 81.9843 24.7161C82.103 25.6613 82.104 26.0335 82.1431 26.6553" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M97.6812 9.27832C97.9219 10.7039 98.6169 13.2558 100.45 20.4993C100.979 22.5919 101.375 23.3318 101.765 23.6317C103.697 25.1157 105.641 18.0415 106.084 13.5991C106.159 12.8399 106.583 16.4783 108.01 18.7634C108.801 20.031 110.024 20.2323 110.893 20.6158C111.876 21.0499 113.12 17.1722 114.188 12.3464C114.31 10.3336 114.314 7.20928 114.267 5.10637C114.221 3.00346 114.122 2.01668 114.021 1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M120.667 5.71484C120.667 5.78187 120.667 5.84891 120.716 7.07711C120.765 8.30531 120.863 10.6927 121.082 12.8174C121.3 14.9422 121.637 16.7321 122.02 19.0762" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M125.691 5.66699C125.707 5.66151 125.722 5.65604 127.059 5.32192C128.395 4.98781 131.051 4.32523 133.943 3.92139C136.835 3.51754 139.883 3.3925 143.023 3.26367" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M134.233 4.04492C134.299 5.24812 134.152 9.87211 133.962 14.4283C133.888 15.4893 133.734 16.4513 133.651 17.1333C133.569 17.8152 133.562 18.1881 133.554 18.5723" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M142.555 7.72656C142.564 7.78908 142.573 7.8516 142.581 10.155C142.59 12.4583 142.598 17.0007 142.606 21.6807" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M144.029 14.1064C144.031 14.1064 145.086 13.6591 147.405 12.8005C148.672 12.3891 150.122 12.0272 151.159 11.7872C152.197 11.5473 152.779 11.4403 153.379 11.3301" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M153.159 4.50098C153.181 4.52289 153.57 5.91187 154.403 9.37663C155.375 14.2184 155.942 17.8945 155.98 19.337C155.984 19.9415 155.957 20.2873 155.929 20.6436" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15.8103 65.0186C15.808 65.0186 15.8058 65.0186 16.7535 67.3814C17.7013 69.7443 19.5991 74.47 21.3483 78.1282C23.0974 81.7865 24.6404 84.2341 25.7536 86.3549C27.5031 90.1957 28.273 92.573 28.4458 93.7227C28.5046 94.2671 28.5046 94.7325 28.5046 95.2119" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3.30908 81.085C3.31907 81.085 3.32906 81.085 9.19219 81.0294C15.0553 80.9738 26.7713 80.8626 39.5435 80.7148" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M35.0737 64.2373C35.0641 64.2521 35.0544 64.267 32.4167 68.1969C29.7789 72.1268 24.5134 79.9714 21.279 84.6067C17.1439 90.5326 15.2621 92.6227 14.1602 94.2054C13.5275 95.0504 13.1317 95.7083 12.7918 96.4632C12.6478 96.7977 12.5618 97.034 12.4507 97.3047" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7.83936 73.3662C9.00291 74.0251 12.7384 76.0234 17.5622 78.0658C19.8894 79.0511 22.1366 79.5171 24.354 80.1228C31.2584 82.0085 32.8773 82.9958 34.3722 84.0508C35.4126 85.0464 36.2455 85.647 36.9081 86.033C37.2691 86.2456 37.6803 86.4921 38.3179 86.8506" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M38.106 74.3408C36.7156 75.1126 32.5888 76.8809 27.7703 78.4788C25.001 79.3971 21.5352 80.415 18.8829 81.37C14.4189 82.9773 11.5936 84.7233 9.74925 85.8871C7.85037 86.9534 5.85751 88.0465 3.70197 89.0201C2.69918 89.4403 1.88127 89.7107 1.00049 89.9902" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M62.9592 64.5668C62.9515 64.5591 62.6726 64.1426 62.1506 63.4238C61.4037 62.3955 57.2143 62.3455 53.7228 63.4626C49.1585 64.923 49.1611 70.069 48.8541 73.0901C48.5957 75.6332 49.7737 77.2139 50.6748 78.4271C51.7521 79.8776 55.8507 80.6086 59.8222 81.0135C62.9416 80.8392 64.7543 79.9202 66.9596 78.0697C67.329 77.6354 67.4605 77.2851 67.6067 76.8793" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M68.2769 58.6309C68.7348 60.3798 70.3832 65.8652 71.1891 69.0171C71.8211 70.7722 72.4126 72.3404 72.7721 73.4383C72.9402 73.942 73.0791 74.3371 73.2222 74.7451" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M87.3679 62.2225C86.8141 61.8293 84.4975 60.4459 82.9147 59.8999C81.5858 59.4415 80.1727 60.4346 78.9856 61.4994C77.2275 63.0765 77.2389 65.4721 77.2349 66.8594C77.2304 68.4251 77.7447 69.72 78.6881 70.756C80.3128 72.5401 83.3351 71.7004 84.9119 71.22C86.6734 70.6833 87.0861 68.3109 87.695 65.3077C88.3573 62.0412 87.6327 60.6454 87.6055 60.4366C87.463 59.3409 88.3294 63.0194 89.4295 64.8631C90.23 66.2046 91.4293 67.4969 92.3696 68.4637C92.5968 68.7461 92.8756 69.1135 93.0701 69.4257C93.2646 69.7379 93.3665 69.9838 93.4861 70.3592" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M92.147 58.6727C92.784 59.8081 93.6845 62.0247 94.6794 63.8347C95.0847 64.5722 95.9655 65.3839 97.7752 66.3324C100.39 67.7026 102.707 67.0802 103.249 66.7964C103.733 66.5427 104.08 66.0502 104.422 65.5461C106.124 63.0344 104.523 56.6692 103.858 54.7913C103.669 54.2589 103.965 54.5244 104.253 54.9428C105.457 56.6907 105.753 57.8703 106.273 58.9503C107.243 60.5952 107.776 61.6097 108.512 62.4941C108.973 63.0098 109.609 63.6614 110.29 64.3523" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M121.382 52.8332C120.145 52.338 117.248 51.3152 113.827 51.4951C112.597 51.5598 112.032 53.073 111.547 54.3056C111.038 55.6011 111.721 56.6776 112.027 58.1377C112.14 58.6741 112.231 59.4169 112.364 59.9054C112.497 60.3938 112.642 60.6107 113.294 60.8645C115.054 61.5488 116.921 61.6829 118.033 61.5975C118.871 61.5332 119.377 61.0227 119.757 60.5168C120.834 59.0819 121.14 56.7076 121.402 53.4288C121.652 50.3113 120.306 47.2614 118.462 44.2926C118.092 43.6967 118.013 43.4449 117.988 43.5706C117.313 47.0126 120.223 52.4049 120.824 54.509C121.618 56.2314 122.472 57.7213 123.519 59.0055C124 59.5607 124.379 59.92 124.77 60.2902" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M127.462 54.3504C128.205 54.2132 129.729 53.9797 132.102 53.7792C133.907 53.6266 136.445 53.5664 137.967 53.3747C138.464 53.3121 138.332 52.9958 138.082 52.5592C136.826 50.3678 136.025 48.6561 134.886 48.0572C133.475 47.3157 131.752 48.2198 130.698 49.0457C129.835 49.7215 129.286 50.7322 128.752 52.3035C127.971 54.6032 128.434 58.044 129.172 59.1767C129.812 60.16 132.549 60.511 136.044 60.9008C139.109 61.0959 140.965 60.8385 141.687 60.3113C142.005 60.09 142.226 59.9623 142.681 59.6336" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M119.863 77.0967L119.898 76.8906" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M131.133 74.5352C131.086 74.5632 131.039 74.5912 130.961 74.7278C130.883 74.8644 130.776 75.1087 130.744 75.1088C130.711 75.109 130.758 74.8576 130.805 74.7256" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M108.47 82.4043C108.668 82.6886 109.33 83.6594 111.802 85.9177C112.529 86.5816 113.468 86.8803 116.731 87.5789C119.993 88.2775 125.632 89.2649 128.872 89.7834C132.772 90.4074 133.941 90.1346 135.031 89.5053C137.442 87.5372 139.378 84.573 142.042 80.0018C143.211 77.8557 144.01 76.062 144.833 74.2021" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M25.9321 65.5215C25.5319 67.5856 24.7537 72.8869 24.2383 75.9473C23.7762 78.6912 22.541 82.9522 21.9713 85.4636C20.7859 89.764 19.9572 94.1328 19.8309 95.9563C19.7974 96.3592 19.7613 96.6392 19.438 97.2295" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M162.291 40.9457C162.042 40.6531 161.677 40.3225 161.173 40.0124C158.371 38.286 152.421 40.0834 151.55 40.6544C150.395 41.4109 149.572 45.6496 149.368 50.7821C149.303 52.425 149.924 53.2807 150.335 53.7351C151.333 54.8382 153.59 55.3381 157.789 55.5282C160.036 54.9076 161.65 53.9172 162.156 53.5335C162.457 53.2916 162.847 52.9539 163.25 52.6059" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M174.013 43.3145C173.992 43.3145 172.223 43.2819 169.33 43.5305C167.516 43.6864 167.096 45.347 166.814 45.9863C166.14 47.5085 166.614 49.6164 167.024 50.5594C167.464 51.5724 168.996 51.7686 170.311 51.7716C171.398 51.7742 172.961 50.9327 174.384 49.6903C175.815 48.4402 175.956 46.7942 176.07 45.0001C175.832 44.3917 175.303 43.94 174.579 43.5531C174.21 43.3786 173.838 43.2484 173.262 43.0098" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M184.579 40.7308C184.302 40.6709 183.363 40.649 182.028 40.7317C181.201 40.7829 180.673 41.4369 180.185 42.0906C179.351 43.2058 179.428 46.6922 179.594 48.7843C179.619 49.0889 179.811 49.3442 180.008 49.5428C180.206 49.7413 180.471 49.8622 180.786 49.8817C182.101 49.9635 183.064 49.1436 184.3 48.4307C184.853 48.1116 185.337 47.8794 185.687 47.5158C186.037 47.1524 186.208 46.6338 186.248 45.9799C186.342 44.4579 184.696 41.8214 183.334 37.7006C182.765 35.9781 182.492 35.0552 182.332 34.6749C181.577 32.8778 186.385 40.0946 188.018 42.483C189.089 44.0494 189.101 45.2794 189.419 46.5075C189.509 46.8953 189.635 47.3713 189.754 47.7673C189.872 48.1633 189.98 48.465 190.143 48.85" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M193.339 45.9424C193.622 45.7061 197.072 43.6647 199.573 40.0506C199.975 39.47 199.93 39.15 199.781 38.9263C199.391 38.3396 198.153 38.2421 196.943 38.1962C195.895 38.1564 195.141 38.5447 194.674 38.9903C193.853 39.7739 194.055 41.1968 194.346 42.5091C194.644 43.8513 195.854 44.9754 196.278 45.9889C196.383 46.2402 196.559 46.4541 196.886 46.6042C199.394 47.7549 202.943 46.5599 204.226 46.0939C205.196 45.9079 205.954 45.6018 206.374 45.1965C206.591 45.0125 206.814 44.8726 207.193 44.7666" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

/* ── animated badge wrapper — draws SVG paths sequentially ── */
const AnimatedBadge = memo(function AnimatedBadge() {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const paths = ref.current.querySelectorAll('path')
    paths.forEach((path, i) => {
      const length = path.getTotalLength()
      path.style.strokeDasharray = length
      path.style.strokeDashoffset = length
      path.style.animation = `handDraw 0.5s ease ${0.8 + i * 0.04}s forwards`
    })
  }, [])

  return (
    <div ref={ref} className="slide-badge">
      <ClaudeBadge />
    </div>
  )
})

/* ── "Thanks for watching!" hand-drawn SVG ── */
const ThanksWatching = () => (
  <svg className="slide-thanks-svg" viewBox="0 0 739 516" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.00014 69.5601C4.02329 69.5615 4.04645 69.563 18.3812 65.4741C32.716 61.3853 61.3618 53.2061 94.6208 45.7668C127.88 38.3274 164.884 31.8759 187.524 27.3637C210.164 22.8516 217.317 20.4743 223.36 18.7149C229.402 16.9555 234.115 15.886 239.374 14.6177" strokeWidth="8" strokeLinecap="round"/>
    <path d="M118.162 39.7461C118.147 39.9738 118.133 40.2015 118.248 48.2107C118.363 56.22 118.608 72.0038 121.178 98.4075C123.748 124.811 128.636 161.356 131.202 181.806C133.768 202.257 133.863 205.505 133.962 208.851" strokeWidth="8" strokeLinecap="round"/>
    <path d="M172.9 73.7598C173.637 76.9812 174.373 80.2027 178.255 95.6138C182.137 111.025 189.142 138.528 193.001 154.439C199.018 180.261 201.742 187.878 202.391 192.458C202.637 195.174 202.714 198.687 203.216 204.721" strokeWidth="8" strokeLinecap="round"/>
    <path d="M183.238 159.216C187.509 158.668 201.432 155.921 222.835 150.563C239.795 144.418 253.623 136.606 264.234 129.318C268.519 126.493 270.571 125.444 272.685 124.363" strokeWidth="8" strokeLinecap="round"/>
    <path d="M257.146 79.5186C257.241 79.8546 257.336 80.1906 257.693 93.386C258.049 106.581 258.665 132.626 260.077 151.915C261.488 171.205 263.678 182.95 266 196" strokeWidth="8" strokeLinecap="round"/>
    <path d="M283.052 172.485C283.448 169.167 284.808 155.568 288.95 131.651C291.064 119.441 296.718 107.822 299.886 99.126C308.417 75.7115 314.993 64.7853 317.889 60.8495C318.674 59.783 319.754 67.5065 321.747 77.9673C324.208 90.8844 328.488 102.851 331.398 115.708C333.149 123.44 337.124 133.195 340.488 144.593C343.853 155.991 346.912 168.627 348.827 175.946C350.741 183.265 351.418 184.883 353.496 188.724" strokeWidth="8" strokeLinecap="round"/>
    <path d="M287.491 140.083C289.853 139.572 292.216 139.062 307.651 136.794C323.087 134.526 351.524 130.516 380.824 126.384" strokeWidth="8" strokeLinecap="round"/>
    <path d="M377.787 159.838C377.788 159.816 377.789 159.794 378.362 148.294C378.935 136.794 380.079 113.815 380.44 100.893C381.077 78.0549 374.838 65.8715 374.821 64.4937C374.765 60.0787 380.372 80.5077 389.402 98.5728C395.562 110.894 405.601 125.609 412.083 140.23C417.808 153.146 422.925 165.117 433.99 177.715C436.368 180.423 437.05 181.335 437.677 181.23C439.371 180.947 440.364 169.459 441.794 142.732C442.278 125.341 442.274 100.18 442.851 80.1903C443.428 60.201 444.586 46.1463 445.41 29.0982" strokeWidth="8" strokeLinecap="round"/>
    <path d="M472.106 52.0643C472.035 52.1243 471.172 68.6089 470.407 98.6526C469.8 122.486 472.459 135.65 473.204 143.214C473.943 148.138 475.412 155.266 476.087 159.431C476.761 163.596 476.595 164.582 476.424 165.599" strokeWidth="8" strokeLinecap="round"/>
    <path d="M543.689 62.7941C543.364 62.9389 529.283 69.1865 506.443 79.9403C486.378 89.3873 480.544 97.368 477.492 100.772C474.583 104.017 472.207 106.55 471.572 108.225C471.233 109.118 472.983 110.273 483.81 114.206C494.636 118.138 515.029 124.858 527.657 129.413C544.532 136.157 550.002 140.399 552.231 143.927C553.366 145.468 554.507 146.503 555.811 147.639" strokeWidth="8" strokeLinecap="round"/>
    <path d="M652.109 52.1529C651.599 52.1207 636.125 50.3858 612.265 48.367C598.614 47.2119 590.181 54.4311 573.548 59.1284C562.855 62.1482 558.421 69.1684 557.58 71.3937C553.692 81.6833 565.825 99.5251 577.29 108.836C591.671 120.515 606.253 120.673 617.645 119.832C626.872 119.15 643.035 117.214 655.116 116.628C684.627 115.199 690.595 119.896 693.139 121.51C701.738 126.963 695.493 148.854 691.333 156.554C684.998 168.282 665.386 170.457 653.272 172.888C643.226 173.426 636.618 172.355 624.803 168.559C616.09 165.673 601.86 160.837 587.199 155.854" strokeWidth="8" strokeLinecap="round"/>
    <path d="M297.527 227.945C298.641 227.827 301.87 227.588 313.501 225.724C322.477 224.037 337.691 220.848 348.218 218.948C358.744 217.047 364.121 216.531 369.66 216" strokeWidth="8" strokeLinecap="round"/>
    <path d="M296 228.035C296.126 233.952 296.261 239.519 297.21 248.89C302.981 281.901 306.296 290.945 307.021 294.296C307.414 295.914 307.858 297.363 308.317 298.855" strokeWidth="8" strokeLinecap="round"/>
    <path d="M302.055 262.93C302.112 262.93 303.636 262.93 306.572 262.855C309.353 262.631 312.966 261.893 317.684 260.363C320.171 259.418 322.846 258.129 327.086 256.312" strokeWidth="8" strokeLinecap="round"/>
    <path d="M392.199 239.808C388.938 239.245 365.977 237.439 350.388 242.171C346.909 243.227 346.482 247.205 345.876 251.525C344.011 264.814 351.429 273.29 356.09 277.405C360.723 281.495 369.818 279.588 377.799 277.373C383.914 275.676 387.995 272.943 392.687 267.16C396.602 259.209 398.221 249.265 397.054 242.912C396.362 242.07 395.333 241.554 392.473 240.574" strokeWidth="8" strokeLinecap="round"/>
    <path d="M408.512 225.855C411.248 231.531 421.406 250.835 425.982 264.136C426.916 270.448 427.564 274.827 428.003 277.186C428.168 278.432 428.214 279.777 427.613 280.73" strokeWidth="8" strokeLinecap="round"/>
    <path d="M405.574 225.414C412.777 224.85 438.209 221.737 446.83 221.417C451.96 221.227 446.72 232.557 444.758 237.26C442.33 243.083 433.014 245.754 425.027 249.596C423.073 250.536 421.293 250.818 424.77 251.247C436.919 252.746 455.294 253.896 470.226 256.181C475.84 257.135 477.47 257.672 479.82 258.275C482.17 258.877 485.192 259.528 490.57 260.218" strokeWidth="8" strokeLinecap="round"/>
    <path d="M69.0001 316.047C69.4771 317.181 73.532 325.567 83.1552 347.878C89.3459 362.23 96.6726 383.368 102.967 401.395C109.262 419.423 113.914 433.862 116.677 440.678C119.441 447.493 120.174 446.248 122.306 439.019C128.293 418.713 132.105 401.009 132.979 391.466C134.953 369.887 136.714 356.269 138.41 349.245C140.677 339.854 141.618 371.121 146.279 382.648C152.749 398.647 158.753 406.69 160.843 412.431C161.696 414.773 161.66 418.702 163.485 417.038C165.31 415.374 168.542 408.119 171.553 399.818C174.565 391.517 177.26 382.389 179.659 367.969C182.059 353.549 184.083 334.114 185.82 320.97C187.558 307.826 188.947 301.563 190.379 295.109" strokeWidth="8" strokeLinecap="round"/>
    <path d="M195.297 397.715C195.372 397.406 198.25 387.516 202.659 371.35C205.147 362.23 205.597 355.82 208.23 348.284C214.92 329.128 217.486 319.49 219.11 318.237C219.922 317.61 220.843 317.18 222.13 317.623C225.403 318.749 231.764 328.19 241.373 343.559C250.137 360.105 256.741 375.739 260.388 387.674C261.69 392.744 261.875 395.812 262.067 398.973" strokeWidth="8" strokeLinecap="round"/>
    <path d="M205.801 370.375C209.134 370.264 212.468 370.153 217.34 369.858C222.212 369.563 228.522 369.088 235.884 367.494C243.247 365.901 251.469 363.204 259.942 360.426" strokeWidth="8" strokeLinecap="round"/>
    <path d="M336.07 318.809C335.341 318.809 334.611 318.809 321.89 319.055C309.169 319.302 284.478 319.796 259.039 320.305" strokeWidth="8" strokeLinecap="round"/>
    <path d="M292.574 321.699C291.868 325.865 291.01 332.682 290.305 344.138C289.867 372.996 288.568 385.26 287.795 391.226C287.506 393.628 287.426 394.76 287.344 395.926" strokeWidth="8" strokeLinecap="round"/>
    <path d="M363.508 348.652C361.271 347.88 339.439 344.98 325.715 347.479C318.336 348.822 316.575 361.401 315.128 367.68C312.149 380.604 316.827 389.608 320.146 395.288C321.895 398.283 324.377 399.882 327.257 401.101C346.292 404.657 370.648 405.765 373.412 402.58C374.525 401.146 375.049 400.081 375.758 398.476" strokeWidth="8" strokeLinecap="round"/>
    <path d="M381.231 334.773C381.231 335.114 381.231 337.292 383.653 348.938C385.677 358.671 390.919 375.801 393.72 386.248C398.687 404.773 400.261 411.39 400.444 416.525C400.242 417.676 399.792 418.715 399.452 419.74C399.113 420.766 398.898 421.747 398.461 425.145" strokeWidth="8" strokeLinecap="round"/>
    <path d="M391.152 379.215C391.631 378.935 392.109 378.655 398.609 374.886C405.108 371.118 417.615 363.868 431.774 355.816" strokeWidth="8" strokeLinecap="round"/>
    <path d="M431.035 320.004C431 322.142 430.966 324.281 433.025 333.971C435.084 343.661 439.239 360.838 443.733 376.027C448.227 391.217 452.935 403.899 456.021 413.232C459.108 422.566 460.43 428.167 461.793 433.938" strokeWidth="8" strokeLinecap="round"/>
    <path d="M466.715 290C466.623 293.313 466.532 296.626 467.293 310.307C468.054 323.989 469.671 347.938 470.79 361.611C471.91 375.284 472.483 377.955 472.743 379.846C473.003 381.737 472.933 382.767 472.699 384.367" strokeWidth="8" strokeLinecap="round"/>
    <path d="M494.309 394.691C494.806 392.216 496.492 379.467 498.857 358.727C500.674 342.795 501.709 330.284 503.296 322.473C504.024 318.889 503.971 339.065 509.109 357.723C513.858 374.97 523.772 394.012 526.45 401.318C529.241 408.935 536.898 416.653 539.386 417.195C543.226 418.033 548.206 405.46 555.325 391.606C558.662 385.113 560.476 379.237 563.178 366.715C565.88 354.193 569.169 335.081 571.022 322.39C573.19 304.006 573.737 296.724 574.073 293.995C574.188 292.684 574.188 291.52 574.188 290.32" strokeWidth="8" strokeLinecap="round"/>
    <path d="M651.508 313.929C644.453 313.703 630.745 313.978 625.691 316.755C619.621 320.092 615.293 324.539 612.462 330.639C606.984 342.447 604.217 359.871 602.952 374.803C602.013 385.886 606.334 389.971 610.841 394.646C614.08 398.004 621 400.949 633.228 405.498C652.278 412.585 668.441 414.57 674.772 415.268C681.757 416.039 689.264 409.203 702.255 395.383C709.936 387.21 710.441 376.529 710.327 362.991C710.304 360.242 709.565 359.346 708.181 358.973C695.772 355.624 675.683 367.15 667.635 369.435C666.068 369.793 664.659 370.199 660.763 370.649C656.866 371.099 650.525 371.581 643.313 372.297" strokeWidth="8" strokeLinecap="round"/>
    <path d="M722.633 293.031C722.633 293.25 722.799 297.567 723.829 310.139C725.537 330.984 728.731 346.844 730.296 353.825C732.219 367.643 733.137 372.012 733.594 376.995C733.725 379.669 733.653 382.639 733.578 385.699" strokeWidth="8" strokeLinecap="round"/>
    <path d="M734.074 414.398L734.86 413.883" strokeWidth="8" strokeLinecap="round"/>
    <path d="M358.07 462.387L358.672 462.207" strokeWidth="8" strokeLinecap="round"/>
    <path d="M395.192 460.637L394.098 460.586" strokeWidth="8" strokeLinecap="round"/>
    <path d="M330.36 478.184C331.708 479.457 333.078 481.209 338.293 486.312C350.372 498.133 366.117 506.402 376.43 509.744C382.043 511.563 385.164 511.625 394.7 509.706C417.864 503.965 433.884 498.828 435.139 496.037C435.808 494.44 436.541 492.478 438.582 488.066" strokeWidth="8" strokeLinecap="round"/>
  </svg>
)

/* ── animated "Thanks for watching" wrapper ── */
const AnimatedThanks = memo(function AnimatedThanks({ onAnimationDone, isActive }) {
  const ref = useRef(null)
  const hasAnimated = useRef(false)
  const callbackRef = useRef(onAnimationDone)
  callbackRef.current = onAnimationDone
  const setupDone = useRef(false)

  /* set initial hidden state once */
  useEffect(() => {
    if (!ref.current || setupDone.current) return
    setupDone.current = true
    const paths = ref.current.querySelectorAll('path')
    paths.forEach((path) => {
      const length = path.getTotalLength()
      path.style.stroke = 'white'
      path.style.strokeDasharray = length
      path.style.strokeDashoffset = length
    })
  }, [])

  /* animate when slide becomes active */
  useEffect(() => {
    if (!isActive || hasAnimated.current || !ref.current) return
    hasAnimated.current = true
    const el = ref.current
    const paths = el.querySelectorAll('path')
    paths.forEach((path, i) => {
      path.style.animation = `handDraw 0.7s ease ${0.3 + i * 0.06}s forwards`
    })
    const lastDelay = 0.3 + (paths.length - 1) * 0.06
    const totalMs = (lastDelay + 0.7) * 1000 + 100
    setTimeout(() => {
      paths.forEach((p) => {
        p.style.animation = 'none'
        p.style.strokeDashoffset = '0'
      })
      callbackRef.current?.(el)
    }, totalMs)
  }, [isActive])

  return (
    <div ref={ref} className="slide-thanks-wrap">
      <ThanksWatching />
    </div>
  )
})

/* ── toolbar icons ── */
const IconPencil = () => (
  <svg width="20" height="20" viewBox="0 0 23 23" fill="none">
    <path d="M22.6885 5.41406L6.76758 21.335L6.4707 21.3945L1.4707 22.3945L0 22.6885L0.293945 21.2178L1.29395 16.2178L1.35352 15.9209L17.2744 0L22.6885 5.41406ZM3.19531 16.9062L2.54883 20.1387L5.78125 19.4922L16.8594 8.41309L14.2734 5.82715L3.19531 16.9062ZM15.6875 4.41309L18.2734 6.99902L19.8604 5.41406L17.2744 2.82812L15.6875 4.41309Z" fill="currentColor"/>
  </svg>
)
const IconBrush = () => (
  <svg width="20" height="20" viewBox="0 0 23 23" fill="none">
    <path d="M1.05859 21.1211L1.1123 22.1191L0 22.1797L0.0595703 21.0664L1.05859 21.1211ZM1.76562 14.7568C3.32816 13.1944 5.86035 13.1943 7.42285 14.7568C8.98524 16.3193 8.98526 18.8516 7.42285 20.4141C6.95309 20.8834 6.25871 21.1767 5.64258 21.374C4.99174 21.5825 4.26696 21.7322 3.6084 21.8398C2.94566 21.9481 2.32482 22.0181 1.87109 22.0605C1.64368 22.0818 1.45645 22.0961 1.3252 22.1055C1.25977 22.1101 1.20784 22.114 1.17188 22.1162C1.1541 22.1173 1.13974 22.1176 1.12988 22.1182C1.1251 22.1184 1.12096 22.119 1.11816 22.1191H1.11328L1.05859 21.1211L0.0605469 21.0664V21.0498C0.0611198 21.04 0.0623626 21.0257 0.0634766 21.0078C0.0657192 20.9719 0.069538 20.92 0.0742188 20.8545C0.0836031 20.7233 0.0978479 20.536 0.119141 20.3086C0.161627 19.8548 0.231538 19.2332 0.339844 18.5703C0.447432 17.9119 0.59727 17.1878 0.805664 16.5371C1.00303 15.921 1.29626 15.2266 1.76562 14.7568ZM6.00879 16.1709C5.27615 15.4383 4.11788 15.3931 3.33203 16.0342L3.17969 16.1709C3.06364 16.2872 2.88736 16.5936 2.70996 17.1475C2.54354 17.6671 2.41299 18.2845 2.31348 18.8936C2.24818 19.2933 2.19916 19.6795 2.16113 20.0176C2.49947 19.9795 2.88607 19.9316 3.28613 19.8662C3.89528 19.7667 4.51253 19.6362 5.03223 19.4697C5.58613 19.2923 5.89244 19.1161 6.00879 19L6.14551 18.8477C6.78656 18.0618 6.74133 16.9035 6.00879 16.1709ZM16.8516 0.914062C18.0701 -0.304462 20.0471 -0.304462 21.2656 0.914062C22.484 2.1326 22.4841 4.10964 21.2656 5.32812L11.0586 15.5352L6.64453 11.1211L16.8516 0.914062ZM9.47266 11.1211L11.0586 12.707L17.6445 6.12109L16.0586 4.53516L9.47266 11.1211ZM19.8516 2.32812C19.4141 1.89065 18.7031 1.89065 18.2656 2.32812L17.4727 3.12109L19.0586 4.70703L19.8516 3.91406C20.289 3.47662 20.2889 2.76561 19.8516 2.32812Z" fill="currentColor"/>
  </svg>
)
const IconEraser = () => (
  <svg width="20" height="18" viewBox="0 0 23 21" fill="none">
    <path d="M12.3043 0.772461C13.4819 -0.291388 15.2992 -0.255879 16.4341 0.878906H16.4351L21.9849 6.42871C23.1564 7.60029 23.1564 9.50027 21.9849 10.6719L14.5718 18.085H22.5074V20.085H12.5718L12.5709 20.0859H4.52887L0.878479 16.4355V16.4346C-0.292869 15.263 -0.292795 13.364 0.878479 12.1924L12.192 0.878906L12.3043 0.772461ZM2.29254 13.6064C1.90227 13.997 1.90223 14.63 2.29254 15.0205L5.35699 18.0859H10.5074V18.085H11.7437L14.4185 15.4102L7.45367 8.44531L2.29254 13.6064ZM15.0201 2.29297C14.6295 1.90259 13.9965 1.90247 13.606 2.29297L8.86774 7.03125L15.8326 13.9961L20.5709 9.25781C20.9614 8.86721 20.9614 8.23329 20.5709 7.84277L15.0201 2.29297Z" fill="currentColor"/>
  </svg>
)
const IconClear = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M5 21C5 21.2652 5.10543 21.5195 5.29297 21.707C5.48051 21.8946 5.73478 22 6 22H18C18.2652 22 18.5195 21.8946 18.707 21.707C18.8946 21.5195 19 21.2652 19 21V8H21V21C21 21.7957 20.6837 22.5585 20.1211 23.1211C19.5585 23.6837 18.7957 24 18 24H6C5.20435 24 4.44152 23.6837 3.87891 23.1211C3.3163 22.5585 3 21.7956 3 21V8H5V21ZM16.4141 11.9854L13.4141 14.9854L16.4141 17.9854L15 19.3994L12 16.3994L9 19.3994L7.58594 17.9854L10.5859 14.9854L7.58594 11.9854L9 10.5713L12 13.5713L15 10.5713L16.4141 11.9854ZM17 4H24V6H0V4H7V0H17V4ZM9 4H15V2H9V4Z" fill="currentColor"/>
  </svg>
)

/* ── whiteboard drawing canvas ── */
const COLORS = ['#ffffff', '#000000', '#ff4444', '#4488ff', '#ffcc00', '#44cc66']
const TOOLS = {
  pencil: { lineWidth: 3, composite: 'source-over' },
  brush: { lineWidth: 14, composite: 'source-over' },
  eraser: { lineWidth: 28, composite: 'destination-out' },
}

/* build a circle‑cursor SVG data-URI matching the tool size */
function buildCircleCursor(diameter) {
  const minSize = 8
  const d = Math.max(diameter, minSize)
  const pad = 2
  const size = d + pad * 2
  const r = d / 2
  const cx = size / 2
  const cy = size / 2
  const crossSize = 3
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>`
    + `<circle cx='${cx}' cy='${cy}' r='${r}' fill='none' stroke='white' stroke-width='1.5'/>`
    + `<circle cx='${cx}' cy='${cy}' r='${r}' fill='none' stroke='rgba(0,0,0,0.4)' stroke-width='0.5'/>`
    + (d <= 12
      ? `<line x1='${cx - crossSize}' y1='${cy}' x2='${cx + crossSize}' y2='${cy}' stroke='white' stroke-width='1'/>`
        + `<line x1='${cx}' y1='${cy - crossSize}' x2='${cx}' y2='${cy + crossSize}' stroke='white' stroke-width='1'/>`
      : '')
    + `</svg>`
  const hot = Math.floor(size / 2)
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hot} ${hot}, crosshair`
}

function Whiteboard({ isActive }) {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const isDrawing = useRef(false)
  const [tool, setTool] = useState('pencil')
  const [color, setColor] = useState('#ffffff')
  const [ready, setReady] = useState(false)

  /* find parent slide element */
  const getSlide = useCallback(() => {
    return canvasRef.current?.closest('.deck-slide')
  }, [])

  /* size canvas to match slide */
  useEffect(() => {
    const canvas = canvasRef.current
    const slide = getSlide()
    if (!canvas || !slide) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = slide.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctxRef.current = ctx
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [getSlide])

  /* rasterize SVG onto canvas when animation finishes */
  const handleAnimationDone = useCallback((thanksEl) => {
    const canvas = canvasRef.current
    const slide = getSlide()
    if (!canvas || !slide || !thanksEl) return

    const svg = thanksEl.querySelector('svg')
    if (!svg) return

    const svgRect = svg.getBoundingClientRect()
    const slideRect = slide.getBoundingClientRect()
    const x = svgRect.left - slideRect.left
    const y = svgRect.top - slideRect.top
    const w = svgRect.width
    const h = svgRect.height

    /* draw SVG paths directly onto canvas via Path2D */
    const ctx = canvas.getContext('2d')
    const viewBox = svg.viewBox.baseVal
    const scaleX = w / viewBox.width
    const scaleY = h / viewBox.height

    ctx.save()
    ctx.translate(x, y)
    ctx.scale(scaleX, scaleY)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = 'source-over'

    const origPaths = svg.querySelectorAll('path')
    origPaths.forEach((p) => {
      const d = p.getAttribute('d')
      if (d) {
        const path2d = new Path2D(d)
        ctx.stroke(path2d)
      }
    })

    ctx.restore()
    /* brief delay then hide original SVG */
    setTimeout(() => {
      thanksEl.style.visibility = 'hidden'
      setReady(true)
    }, 50)
  }, [getSlide])

  /* drawing handlers */
  const getPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const startDraw = useCallback((e) => {
    isDrawing.current = true
    const ctx = ctxRef.current
    if (!ctx) return
    const cfg = TOOLS[tool]
    ctx.globalCompositeOperation = cfg.composite
    ctx.lineWidth = cfg.lineWidth
    ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    e.target.setPointerCapture(e.pointerId)
  }, [tool, color, getPos])

  const draw = useCallback((e) => {
    if (!isDrawing.current || !ctxRef.current) return
    const pos = getPos(e)
    ctxRef.current.lineTo(pos.x, pos.y)
    ctxRef.current.stroke()
  }, [getPos])

  const endDraw = useCallback(() => {
    isDrawing.current = false
    if (ctxRef.current) ctxRef.current.beginPath()
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="whiteboard-canvas"
        onPointerDown={startDraw}
        onPointerMove={draw}
        onPointerUp={endDraw}
        onPointerLeave={endDraw}
        style={{ cursor: buildCircleCursor(TOOLS[tool].lineWidth) }}
      />
      <div className="whiteboard-toolbar">
        <button
          className={`wb-tool${tool === 'pencil' ? ' wb-tool--active' : ''}`}
          onClick={() => setTool('pencil')}
          title="Pencil"
        ><IconPencil /></button>
        <button
          className={`wb-tool${tool === 'brush' ? ' wb-tool--active' : ''}`}
          onClick={() => setTool('brush')}
          title="Brush"
        ><IconBrush /></button>
        <button
          className={`wb-tool${tool === 'eraser' ? ' wb-tool--active' : ''}`}
          onClick={() => setTool('eraser')}
          title="Eraser"
        ><IconEraser /></button>
        <div className="wb-divider" />
        {COLORS.map((c) => (
          <button
            key={c}
            className={`wb-color${c === color ? ' wb-color--active' : ''}`}
            style={{ background: c }}
            onClick={() => { setColor(c); if (tool === 'eraser') setTool('pencil') }}
            title={c}
          />
        ))}
        <div className="wb-divider" />
        <button className="wb-tool" onClick={clearCanvas} title="Clear all">
          <IconClear />
        </button>
      </div>
      <AnimatedThanks onAnimationDone={handleAnimationDone} isActive={isActive} />
    </>
  )
}

/* ── "shop!" wordmark ── */
const ShopWordmark = () => (
  <svg className="slide-shop-wordmark" viewBox="0 0 203 76" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M192.569 47.2757C191.525 47.2274 190.694 46.3835 190.662 45.3389L189.863 19.1707L190.509 5.1896C190.56 4.08621 191.496 3.2331 192.599 3.28413L200.459 3.64758C201.562 3.6986 202.415 4.63444 202.364 5.73783L201.718 19.7189L198.749 45.6945C198.63 46.7399 197.721 47.5139 196.67 47.4653L192.569 47.2757ZM189.29 65.5477C188.186 65.4967 187.333 64.5608 187.384 63.4575L187.795 54.567C187.846 53.4636 188.782 52.6105 189.885 52.6615L198.604 53.0647C199.708 53.1157 200.561 54.0515 200.51 55.1549L200.098 64.0454C200.047 65.1488 199.112 66.0019 198.008 65.9509L189.29 65.5477Z" fill="white"/>
    <g clipPath="url(#clip0_shop)">
      <path d="M21.7664 33.042C14.422 31.4487 11.1501 30.8253 11.1501 27.9952C11.1501 25.3332 13.3643 24.0072 17.7927 24.0072C21.6873 24.0072 24.5342 25.7092 26.6299 29.044C26.788 29.3013 27.1141 29.3903 27.381 29.2519L35.6447 25.0759C35.9413 24.9275 36.0501 24.5515 35.882 24.2645C32.452 18.3171 26.1158 15.0615 17.773 15.0615C6.81067 15.0615 0 20.4645 0 29.054C0 38.1778 8.29339 40.4835 15.6477 42.0767C23.0021 43.6698 26.2839 44.2932 26.2839 47.1235C26.2839 49.9536 23.8917 51.2896 19.1173 51.2896C14.7087 51.2896 11.4368 49.2709 9.45981 45.3522C9.31154 45.0652 8.96558 44.9465 8.67891 45.0948L0.434934 49.1817C0.148273 49.3302 0.0296547 49.6766 0.177928 49.9733C3.44982 56.554 10.1616 60.255 19.1272 60.255C30.5442 60.255 37.4439 54.941 37.4439 46.0845C37.4439 37.2278 29.1109 34.655 21.7664 33.0617V33.042Z" fill="white"/>
      <path d="M66.0507 15.0612C61.3653 15.0612 57.2235 16.7237 54.2483 19.6825C54.0604 19.8606 53.7539 19.7319 53.7539 19.4746V0.583843C53.7539 0.257287 53.497 0 53.1707 0H42.8313C42.505 0 42.248 0.257287 42.248 0.583843V59.2155C42.248 59.5422 42.505 59.7995 42.8313 59.7995H53.1707C53.497 59.7995 53.7539 59.5422 53.7539 59.2155V33.4968C53.7539 28.5291 57.5597 24.7193 62.6899 24.7193C67.8201 24.7193 71.5368 28.45 71.5368 33.4968V59.2155C71.5368 59.5422 71.7938 59.7995 72.12 59.7995H82.4596C82.7857 59.7995 83.0429 59.5422 83.0429 59.2155V33.4968C83.0429 22.6907 75.9653 15.0711 66.0507 15.0711V15.0612Z" fill="white"/>
      <path d="M104.041 13.3888C98.4261 13.3888 93.1478 15.1007 89.3716 17.5845C89.1147 17.7528 89.0257 18.0991 89.1838 18.3664L93.7407 26.1542C93.9088 26.4312 94.2648 26.5302 94.5415 26.3619C97.4081 24.6302 100.69 23.7298 104.041 23.7495C113.066 23.7495 119.698 30.1223 119.698 38.5436C119.698 45.7178 114.39 51.0319 107.659 51.0319C102.173 51.0319 98.367 47.8355 98.367 43.3231C98.367 40.7404 99.4641 38.6227 102.321 37.1284C102.617 36.9701 102.726 36.604 102.548 36.317L98.2483 29.0339C98.1098 28.7963 97.8134 28.6875 97.5465 28.7865C91.7836 30.9239 87.7407 36.0696 87.7407 42.9768C87.7407 53.4266 96.0539 61.2244 107.649 61.2244C121.191 61.2244 130.928 51.8333 130.928 38.3654C130.928 23.9277 119.6 13.3789 104.021 13.3789L104.041 13.3888Z" fill="white"/>
      <path d="M161.162 14.9826C155.933 14.9826 151.268 16.9122 147.857 20.3162C147.67 20.5042 147.363 20.3658 147.363 20.1085V16.0117C147.363 15.6851 147.106 15.4279 146.78 15.4279H136.707C136.381 15.4279 136.124 15.6851 136.124 16.0117V74.5544C136.124 74.881 136.381 75.1383 136.707 75.1383H147.047C147.373 75.1383 147.63 74.881 147.63 74.5544V55.3568C147.63 55.0994 147.936 54.9708 148.124 55.1391C151.525 58.3057 156.022 60.1562 161.172 60.1562C173.301 60.1562 182.762 50.3299 182.762 37.5644C182.762 24.799 173.291 14.9727 161.172 14.9727L161.162 14.9826ZM159.215 50.2407C152.315 50.2407 147.086 44.7486 147.086 37.4852C147.086 30.2219 152.306 24.7298 159.215 24.7298C166.124 24.7298 171.334 30.1327 171.334 37.4852C171.334 44.8378 166.194 50.2407 159.205 50.2407H159.215Z" fill="white"/>
    </g>
    <defs>
      <clipPath id="clip0_shop">
        <rect width="182.762" height="76" fill="white"/>
      </clipPath>
    </defs>
  </svg>
)

/* ── product data ── */
const PRODUCTS = [
  {
    id: 1,
    name: 'Potted Plant',
    variant: 'Cream',
    size: '10\u2033',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=240&h=240&fit=crop',
    outOfStock: true,
  },
  {
    id: 2,
    name: 'Decorative Mug',
    variant: 'Floral',
    price: 20.99,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=240&h=240&fit=crop',
    outOfStock: false,
  },
]

/* ═══════════════════════════════════════════════════
   CartPhone — the iPhone prototype (extracted)
   ═══════════════════════════════════════════════════ */
function CartPhone() {
  const [quantities, setQuantities] = useState({ 1: 1, 2: 1 })

  const updateQty = (id, delta) => {
    setQuantities((q) => ({ ...q, [id]: Math.max(0, q[id] + delta) }))
  }

  const inStock = PRODUCTS.filter((p) => !p.outOfStock)
  const subtotal = inStock.reduce((s, p) => s + p.price * (quantities[p.id] || 0), 0)
  const tax = +(subtotal * 0.1297).toFixed(2)
  const total = +(subtotal + tax).toFixed(2)

  return (
    <div className="ios-device">
      {/* status bar */}
      <div className="ios-status-bar">
        <span className="ios-status-time">9:41</span>
        <div className="ios-status-right">
          <SignalIcon />
          <WifiIcon />
          <BatteryIcon />
        </div>
      </div>

      {/* screen */}
      <div className="ios-screen">
        <div className="cart-nav">
          <span className="cart-nav-title">Cart</span>
        </div>

        <div className="cart-scroll">
          {PRODUCTS.map((product) => (
            <div key={product.id}>
              <div className={`cart-item${product.outOfStock ? ' cart-item--oos' : ''}`}>
                <img className="cart-item-img" src={product.image} alt={product.name} />
                <div className="cart-item-info">
                  <div className="cart-item-row">
                    <div>
                      <div className="cart-item-name">{product.name}</div>
                      <div className="cart-item-variant">
                        {product.variant}
                        {product.outOfStock && <IconWarning />}
                      </div>
                      {product.size && <div className="cart-item-size">{product.size}</div>}
                    </div>
                    <div className="cart-item-price">${product.price.toFixed(2)}</div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="cart-qty">
                      <button className="cart-qty-btn" onClick={() => updateQty(product.id, -1)} aria-label="Decrease">
                        <IconMinus />
                      </button>
                      <span className="cart-qty-val">{quantities[product.id]}</span>
                      <button className="cart-qty-btn" onClick={() => updateQty(product.id, 1)} aria-label="Increase">
                        <IconPlus />
                      </button>
                    </div>
                    <button className="cart-delete-btn" aria-label="Remove item">
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </div>

              {product.outOfStock && (
                <div className="cart-oos-banner">
                  <IconWarning />
                  <span>Variant out of stock, item removed from cart</span>
                </div>
              )}
            </div>
          ))}

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Taxes</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button className="cart-checkout-btn">Checkout</button>
        </div>
      </div>

      {/* tab bar */}
      <div className="ios-tab-bar">
        <button className="ios-tab">
          <IconHome />
          <span>Home</span>
        </button>
        <button className="ios-tab ios-tab--active">
          <IconCart />
          <span>Cart</span>
        </button>
        <button className="ios-tab">
          <IconProfile />
          <span>Profile</span>
        </button>
      </div>

      <div className="ios-home-indicator">
        <div className="ios-home-indicator-bar" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   Slide definitions
   ═══════════════════════════════════════════════════ */
const SLIDES = [
  {
    id: 'intro',
    layout: 'intro',
    heading: (
      <>
        Hello,<br />
        <ShopWordmark />
      </>
    ),
    body: (
      <>
        <p>I had a bunch of fun jamming with Jon and Luke on the design exercise on Friday.</p>
        <p>I also simultaneously felt like there was a lot more I could do outside of the one hour time constraint, so I couldn't help myself but put this together.</p>
        <p>Hopefully it gives you a nice little peek into how I work on things as a designer.</p>
        <p className="slide-sign-off">Thanks,<br />Matt</p>
      </>
    ),
    cta: 'Dive in',
    phone: false,
  },
  {
    id: 'prompt',
    layout: 'split',
    heading: 'First up, the prompt.',
    body: (
      <>
        <p>The prompt was to improve this specific state in the user journey:</p>
        <ul>
          <li>A user has added 2 products to their cart</li>
          <li>They haven't checked out</li>
          <li>Upon returning to their cart, one of the products is out of stock!</li>
          <li>We currently communicate this via an error message.</li>
        </ul>
      </>
    ),
    cta: 'Cool, let\u2019s get to work',
    phone: true,
  },
  {
    id: 'prevent',
    layout: 'split',
    heading: (
      <>
        Let's avoid error states<br />all together.
      </>
    ),
    body: (
      <>
        <p>My immediate thought was, <em>can we avoid this error state all together?</em></p>
        <p>In my product work — I try to <strong>prevent</strong> exposing error states to users as much as possible.</p>
        <p>For this specific user scenario, I'd much prefer to invest more upfront work instilling FOMO in the customer, so that they're more likely to checkout, and therefore never see that a product they had left in their cart had unfortunately sold out.</p>
        <p><strong>Ways we could achieve this:</strong></p>
        <ul>
          <li>Sending abandon cart emails</li>
          <li>Surfacing stock levels on PDP's, example:
            <ul>
              <li>Selling fast!</li>
              <li>Only a few left!</li>
              <li>Only one left!</li>
            </ul>
          </li>
          <li>Also exposing these stock levels in the customer's cart.</li>
          <li>Sending them push/email notifications when stock is low, or selling fast.</li>
        </ul>
      </>
    ),
    phone: true,
  },
  {
    id: 'alternative',
    layout: 'split',
    heading: (
      <>
        If it's truly sold out,<br />suggest an alternative.
      </>
    ),
    body: (
      <>
        <p>After thinking about prevention, my focus then turned to solving the core problem.</p>
        <p>In the original design, the error state didn't offer the user an exit path — it just simply stated the issue.</p>
        <p><strong>We could solve this by:</strong></p>
        <ul>
          <li>Check if there's a close alternative to the product, and suggesting it (e.g a different size, or color).</li>
          <li>Providing an easy "swap" to another size and/or color, potentially with a discount or incentive.</li>
          <li>Providing a small carousel of similar products that they can tap to replace, without ever leaving the cart.</li>
        </ul>
      </>
    ),
    phone: true,
  },
  {
    id: 'outro',
    layout: 'outro',
    body: (
      <>
        <p>It's been a joy to meet more people across the Shop team, and get a look into what you're all working on. Thank you for all of your time.</p>
        <p>Excited to keep chatting!</p>
      </>
    ),
    cta: 'Back to the start',
    phone: false,
  },
]

/* ═══════════════════════════════════════════════════
   Main presentation component
   ═══════════════════════════════════════════════════ */
export default function IosCart() {
  const scrollRef = useRef(null)
  const slideRefs = useRef([])
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    document.title = 'iOS Cart — Matthew Vernon'
    const prev = document.body.style.backgroundColor
    document.body.style.backgroundColor = '#4a25e8'
    return () => { document.body.style.backgroundColor = prev }
  }, [])

  /* track which slide is in view via scroll position */
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const update = () => {
      const h = container.clientHeight
      if (!h) return
      const idx = Math.round(container.scrollTop / h)
      setActiveSlide((prev) => {
        const clamped = Math.max(0, Math.min(idx, SLIDES.length - 1))
        return clamped !== prev ? clamped : prev
      })
    }
    container.addEventListener('scroll', update, { passive: true })
    update()
    return () => container.removeEventListener('scroll', update)
  }, [])

  const scrollToSlide = useCallback((idx) => {
    const container = document.querySelector('.deck')
    if (!container) return
    const target = container.clientHeight * idx
    const start = container.scrollTop
    const diff = target - start
    if (Math.abs(diff) < 2) return
    container.style.scrollSnapType = 'none'
    const duration = 480
    const startTime = performance.now()
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    const step = (now) => {
      const elapsed = Math.min((now - startTime) / duration, 1)
      container.scrollTop = start + diff * ease(elapsed)
      if (elapsed < 1) {
        requestAnimationFrame(step)
      } else {
        container.style.scrollSnapType = ''
      }
    }
    requestAnimationFrame(step)
  }, [])

  const nextSlide = useCallback(() => {
    const next = Math.min(activeSlide + 1, SLIDES.length - 1)
    scrollToSlide(next)
  }, [activeSlide, scrollToSlide])

  /* keyboard navigation */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        const next = Math.min(activeSlide + 1, SLIDES.length - 1)
        scrollToSlide(next)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const prev = Math.max(activeSlide - 1, 0)
        scrollToSlide(prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeSlide, scrollToSlide])

  return (
    <PasswordGate hash={PW_HASH} slug="ioscart">
      <div className="deck" ref={scrollRef}>
        {SLIDES.map((slide, i) => (
          <section
            key={slide.id}
            className={`deck-slide deck-slide--${slide.layout}`}
            ref={(el) => (slideRefs.current[i] = el)}
          >
            {slide.layout === 'intro' ? (
              <div className="slide-intro-content">
                <h1 className="slide-heading">{slide.heading}</h1>
                <div className="slide-body">{slide.body}</div>
                <div className="slide-intro-footer">
                  {slide.cta && (
                    <button className="slide-cta" onClick={nextSlide}>
                      {slide.cta}
                    </button>
                  )}
                  <AnimatedBadge />
                </div>
              </div>
            ) : slide.layout === 'outro' ? (
              <>
                <Whiteboard isActive={activeSlide === i} />
                <div className="slide-outro-content">
                  <div className="slide-body slide-body--outro">{slide.body}</div>
                  {slide.cta && (
                    <button className="slide-cta slide-cta--outro" onClick={() => scrollToSlide(0)}>
                      {slide.cta}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="slide-copy">
                  <h1 className="slide-heading">{slide.heading}</h1>
                  <div className="slide-body">{slide.body}</div>
                  {slide.cta && (
                    <button className="slide-cta" onClick={nextSlide}>
                      {slide.cta}
                    </button>
                  )}
                </div>
                {slide.phone && (
                  <div className="slide-phone-wrap">
                    <CartPhone />
                  </div>
                )}
              </>
            )}
          </section>
        ))}

        {/* dot indicators */}
        <nav className="deck-dots">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              className={`deck-dot${i === activeSlide ? ' deck-dot--active' : ''}`}
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </nav>
      </div>
    </PasswordGate>
  )
}
