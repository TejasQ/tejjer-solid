import { css } from "solid-styled-components";

function Logo(props) {
  return (
    <svg
      version="1.0"
      viewBox="0 0 740.000000 715.000000"
      preserveAspectRatio="xMidYMid meet"
      width={`${props.size || 80}px`}
      height={`${(props.size || 80) / 1.034965034965035}px`}
    >
      <g
        class="dark:fill-white fill-black"
        transform="translate(0.000000,715.000000) scale(0.100000,-0.100000)"
        stroke="none"
      >
        <path
          d="M2015 7140 c-285 -40 -492 -99 -720 -207 -196 -93 -418 -245 -533
-365 -111 -117 -202 -227 -253 -308 -96 -149 -85 -132 -138 -232 -65 -122 -81
-156 -96 -202 -7 -22 -25 -72 -39 -111 -46 -124 -103 -299 -115 -350 -6 -27
-16 -72 -22 -100 -69 -308 -110 -762 -90 -1010 20 -247 40 -449 50 -495 16
-70 41 -206 57 -300 18 -111 39 -192 79 -315 18 -55 45 -152 60 -215 15 -63
33 -125 41 -137 8 -12 14 -29 14 -37 0 -20 60 -173 164 -418 26 -59 46 -112
46 -117 0 -20 190 -362 264 -476 29 -44 79 -120 111 -170 33 -49 99 -139 148
-200 96 -119 347 -395 360 -395 4 0 33 -24 65 -53 143 -129 192 -169 263 -215
42 -28 80 -55 83 -61 10 -15 101 -73 195 -123 42 -23 103 -59 135 -80 33 -21
63 -38 67 -38 4 0 47 -18 96 -41 129 -60 139 -64 243 -108 52 -22 115 -45 139
-51 24 -6 51 -15 60 -20 16 -9 53 -19 171 -47 59 -14 99 -25 251 -68 25 -7 84
-18 130 -24 46 -6 116 -15 154 -20 170 -23 424 -31 626 -21 112 6 231 15 264
21 33 5 101 16 150 24 50 8 126 26 169 40 44 14 102 31 130 37 28 6 63 17 78
24 15 8 35 14 45 14 10 0 35 9 56 20 20 11 43 20 51 20 33 0 410 192 530 271
56 36 117 74 136 85 19 10 62 44 95 74 34 30 88 74 120 97 33 24 94 75 135
114 41 40 95 90 119 112 25 21 59 56 75 77 17 21 78 89 135 152 98 106 222
262 265 332 11 17 43 63 72 101 58 78 174 252 174 260 0 3 39 74 87 158 101
177 293 552 293 573 0 12 65 164 106 248 8 16 13 31 11 33 -7 6 -46 -56 -83
-128 -39 -78 -211 -346 -250 -389 -12 -14 -59 -79 -105 -145 -109 -159 -365
-477 -491 -612 -279 -297 -558 -558 -706 -660 -26 -18 -87 -61 -135 -95 -128
-91 -191 -129 -442 -263 -44 -24 -125 -59 -180 -79 -239 -84 -274 -96 -345
-114 -41 -11 -102 -23 -134 -27 -33 -4 -71 -11 -85 -17 -14 -5 -73 -16 -131
-24 -332 -45 -571 -45 -845 0 -281 47 -430 78 -495 103 -14 6 -59 20 -100 32
-41 13 -97 31 -125 41 -27 10 -61 22 -75 25 -94 27 -438 204 -590 304 -157
103 -257 175 -274 195 -6 7 -40 37 -76 66 -36 30 -117 108 -182 175 -64 66
-132 136 -152 155 -19 19 -57 67 -85 105 -27 39 -78 104 -112 147 -34 42 -76
102 -94 135 -18 32 -56 96 -85 143 -60 96 -160 292 -160 312 0 8 -16 38 -35
68 -19 30 -35 61 -35 70 0 9 -16 54 -36 100 -20 47 -52 126 -70 175 -19 50
-39 99 -44 110 -15 33 -50 143 -50 159 0 8 4 17 8 20 9 5 356 -18 482 -32 l65
-7 57 -113 c31 -63 69 -133 84 -155 32 -48 47 -74 88 -149 30 -56 99 -153 126
-178 10 -8 41 -44 70 -80 103 -126 155 -183 190 -207 19 -13 58 -42 85 -64
260 -212 573 -335 972 -384 158 -19 333 -49 393 -69 43 -13 76 -27 198 -82 29
-13 55 -24 58 -24 14 0 157 -99 226 -157 130 -108 231 -229 298 -358 23 -44
45 -84 49 -88 8 -8 177 58 186 73 2 4 -5 54 -17 111 -19 93 -22 136 -22 399 0
302 13 448 41 472 18 15 56 -3 172 -80 116 -78 259 -193 322 -259 62 -65 177
-217 211 -278 49 -87 119 -239 125 -268 11 -53 59 -68 140 -44 59 17 65 27 65
94 1 51 -6 73 -57 178 -115 236 -157 302 -283 443 -153 171 -321 296 -555 414
-54 27 -101 57 -104 65 -3 8 6 63 20 122 14 58 33 142 42 186 25 123 56 264
72 330 9 33 22 91 29 128 8 38 16 72 18 75 2 4 9 52 16 107 6 55 18 136 26
180 8 44 18 149 21 233 6 144 7 154 27 162 12 5 85 18 163 30 203 31 614 31
818 1 276 -42 651 -149 844 -241 9 -4 32 -14 51 -23 19 -8 88 -40 154 -71 65
-32 125 -56 133 -54 19 4 -170 211 -264 290 -195 164 -327 261 -429 314 -37
19 -89 50 -118 68 -58 39 -133 78 -262 134 -49 22 -109 49 -134 60 -67 30
-334 117 -420 136 -41 9 -113 25 -160 35 -87 20 -197 36 -329 49 l-74 7 -3
235 c-2 129 -8 267 -14 305 -6 39 -15 113 -21 165 -14 136 -44 273 -96 445
-102 339 -232 591 -409 800 -89 104 -276 286 -339 330 -27 19 -81 58 -120 86
-38 28 -97 64 -130 79 -33 16 -87 43 -120 62 -62 35 -197 91 -249 104 -16 4
-41 13 -55 20 -14 8 -33 14 -42 14 -8 0 -51 9 -95 21 -82 21 -129 31 -274 54
-89 15 -413 18 -505 5z m530 -234 c66 -10 152 -27 190 -38 127 -38 220 -70
230 -79 5 -5 15 -9 22 -9 25 0 259 -118 329 -166 102 -69 260 -202 329 -276
118 -126 231 -269 273 -345 101 -183 210 -443 200 -475 -3 -8 -30 -13 -79 -14
-73 -2 -230 -33 -279 -56 -14 -7 -58 -37 -99 -68 -78 -58 -103 -95 -116 -176
-7 -48 -5 -50 85 -90 121 -52 257 -154 355 -264 50 -56 101 -120 115 -143 14
-24 35 -57 48 -75 35 -48 116 -226 142 -312 34 -109 35 -287 2 -348 -36 -68
-138 -120 -210 -107 -20 3 -67 17 -103 31 -56 21 -81 39 -155 113 -113 111
-156 129 -267 111 -125 -21 -256 -99 -442 -262 -88 -77 -256 -260 -328 -358
-234 -315 -349 -552 -406 -835 -22 -113 -35 -245 -23 -245 4 0 25 24 47 52 47
62 356 381 435 450 30 26 93 81 140 123 94 83 163 133 197 141 15 4 47 -8 100
-38 163 -92 271 -118 403 -97 76 12 122 32 222 99 85 57 121 109 163 237 29
87 28 121 -3 108 -9 -5 -49 -19 -89 -32 -56 -19 -85 -36 -130 -79 -81 -76
-132 -99 -213 -98 -87 2 -165 31 -165 62 0 25 14 35 155 100 120 56 256 104
360 128 30 7 80 19 110 28 104 28 159 38 171 31 6 -5 8 -20 5 -39 -4 -18 -13
-98 -21 -179 -8 -80 -21 -179 -29 -219 -8 -40 -17 -95 -21 -123 -3 -27 -12
-70 -20 -95 -7 -25 -16 -63 -20 -85 -8 -53 -83 -399 -97 -450 -38 -140 -92
-455 -108 -635 -6 -58 -14 -170 -20 -249 -6 -79 -13 -147 -16 -152 -11 -18
-31 -8 -69 32 -45 46 -123 107 -182 140 -105 61 -214 113 -292 141 -47 16 -99
36 -116 43 -16 7 -41 16 -55 19 -14 3 -54 12 -90 20 -36 8 -110 18 -165 21
-55 4 -127 13 -160 20 -33 7 -82 16 -110 19 -170 23 -365 95 -555 206 -36 21
-120 86 -185 144 -65 58 -121 106 -125 106 -7 0 -190 224 -200 245 -3 5 -27
44 -54 85 -27 41 -73 116 -102 165 -29 50 -62 105 -73 123 -24 38 -27 65 -8
79 6 5 37 17 67 27 77 27 150 64 157 81 3 9 19 21 37 29 78 34 135 55 191 71
33 9 92 25 130 36 39 11 95 26 125 33 30 8 75 19 100 25 25 6 89 18 143 27 53
9 97 20 97 24 0 17 -60 51 -159 90 -124 50 -229 65 -399 56 -74 -4 -130 -2
-141 3 -32 17 -203 51 -258 51 -50 0 -196 -33 -218 -50 -5 -4 -27 -10 -48 -14
-37 -7 -39 -6 -161 111 -141 134 -187 187 -310 361 -100 141 -147 229 -154
288 -4 37 -1 44 22 59 32 21 117 16 162 -9 156 -88 160 -92 167 -165 7 -82 38
-138 90 -162 52 -23 89 -24 132 -3 44 21 65 54 72 115 5 40 2 55 -14 77 -11
15 -41 59 -68 97 -26 39 -66 89 -89 113 -60 63 -181 140 -257 162 -151 45
-331 9 -418 -84 -32 -35 -37 -100 -17 -222 16 -93 70 -227 111 -274 7 -8 27
-44 45 -80 43 -85 176 -247 322 -392 66 -65 118 -125 118 -135 0 -21 -60 -74
-130 -117 -25 -15 -65 -40 -91 -55 -47 -29 -146 -70 -190 -78 -34 -6 -44 9
-57 87 -6 36 -23 119 -37 185 -15 66 -33 150 -40 188 -8 37 -17 72 -21 78 -11
18 -43 212 -64 384 -11 88 -24 187 -29 220 -12 78 -13 577 -1 675 22 187 72
446 92 483 6 12 22 58 34 102 49 177 143 402 189 455 7 8 26 40 42 71 35 68
157 239 220 309 149 166 384 332 593 417 222 92 279 108 475 138 184 28 424
28 610 1z m1615 -1636 c11 -11 20 -23 20 -27 0 -5 9 -66 20 -137 11 -71 20
-135 20 -142 0 -32 -39 -9 -94 54 -32 37 -88 91 -125 121 -95 77 -141 120
-141 130 0 12 47 17 178 19 90 2 104 0 122 -18z m-2457 -1842 c74 -23 103 -49
86 -80 -7 -12 -21 -18 -47 -18 -42 0 -68 -13 -58 -28 11 -19 -17 -53 -77 -92
-62 -41 -84 -42 -89 -7 -4 30 -36 23 -68 -15 -30 -35 -61 -35 -70 1 -5 21 -7
22 -18 8 -8 -9 -23 -35 -35 -58 -38 -74 -60 -83 -203 -88 -124 -3 -278 12
-305 30 -11 8 -9 14 15 32 16 12 74 57 130 99 56 43 127 97 158 120 31 24 60
51 63 60 22 61 358 84 518 36z"
        ></path>
        <path
          d="M2685 5459 c-33 -5 -71 -13 -85 -18 -14 -5 -40 -13 -58 -16 -48 -10
-181 -88 -224 -132 -112 -114 -120 -125 -125 -162 -3 -21 0 -47 6 -59 14 -26
96 -82 120 -82 10 0 52 35 94 79 94 98 151 138 219 152 29 6 72 15 95 20 68
15 183 10 263 -11 51 -13 78 -16 86 -9 23 19 93 144 96 172 3 25 -2 30 -37 42
-87 31 -319 43 -450 24z"
        ></path>
        <path
          d="M2760 5141 c-131 -43 -214 -134 -212 -233 1 -63 26 -113 85 -170 50
-49 118 -78 181 -78 71 1 171 58 213 121 29 45 41 144 23 208 -27 100 -189
185 -290 152z m85 -155 c71 -30 82 -95 24 -137 -39 -28 -94 -21 -126 16 -32
36 -29 61 11 101 38 38 43 40 91 20z"
        ></path>
      </g>
    </svg>
  );
}

export default Logo;