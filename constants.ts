import { Memory, AnniversaryEvent } from './types';

export const IMAGES = {
  COFFEE:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDB_YoVc1JpSLAQy0q0_dzGLWfVW4spmoFcWBzFjOydUpaCSWGLEej4EYOvkX49nm38quTGJFi-HcZp-q2UpLWVyOfe3NZHMoeRknJroVHnBbupIximxkvR_HUvEREasd-bwKU2pHptLV4vENQNJ5iQg07OaYtND0IMpzFWS66cNdyFXqjXpmkRM5c0BFJm1iQlRICVj8j8AA0-cWekjBcc7AeEjpYZjfZy0j4z2Rqm-FqV8VPv1mynzuT7iTkRmPSvP8ivS20NUuo',
  BEACH:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCKWGadxSaCOnRPUAuRzkKOhFHO2BzjySWQtwqvzcUQVsyGMVAzpXEHlV0wxhNwrZ1D-Owq-PXOg4tXo4suLmMBcP2mqj8WC6kSnS-kBibKfm1MVh3_shEFKRa-PYXioXRNhb3oWSpK-NenT-LCWBOpqr9-WJNtK6ioycq9PGmtWQOMuRNqr3GxKOlHvcNmRF8TLvgm6O3ZTdyeFnxY0xeoBNRRHa3A0xarV8wySHcPjw7VaRrgjukKtC1HYE3aBuMf7si2KM69i0o',
  MOVING:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDqWH8JAq5vCg_m0pIhZ09cyG_Dc1jvB4srwFaxdofvDavXePzZ4G8tl0k3MQLXSgdmCiw6PjaSc9HHlDd9WR7-zeRwWjNOE_LOlxOzpffDD3k7c_WfKWPoDyErj7zzECsW2XmlOwQiMFvUKZt19eK6KkKPzBZ1is54t2Fk3ORDEWv0hfQH-gMxYEW2jCixaitJYYe8TuNQyUUnIMLI9rpam81COfx4iDIeXWAH5D61pliu9JvhBcaU2efXC7Zbyg5FgBtavn8DCL4',
  CONCERT:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDWR4we1tPuYZdLQePLiRnBbelPShat7vlHG5btxAjntlzogVLwEqCQTzG6o2HxYegz_Ox6k-YAxLDInqCD8TZycKzwHHe8oIwjUqB82zKSJNiT1S63RVbeam7lBlbY4QS_6_mzn__joi-RjTQDAwnYF_DHjdLfcdobO5osd6PlC_BsAZNPS_Ql05JwLtz5FFlwE168SyKeEIrPeVBlT51hT6E81pEgOdimhmDPmsHaxREy2850iRqJzupB8PlD5F_6u36wzj_ChVY',
  PICNIC:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCyCFveWHe-AfJk0c90BNsjHSmG3FitI0oG81_onHgj4wZYRw2JrWvzKpjmEkt-2qL-QShHuyxWWsPkWwif5qCQbRcHxg3oJ_paW4A9QC7IOrJ9uv_87rTryaaOTlaReHxImuvIm896Tnve0AG0zI7xdUqsnMxHmunkaZATAA217ynzy_taaV_B-l1677abqgnJ7TyPf3pxb4X5jxqiu5G9GbuVblmkFtDnr5zx6YmRbS1fwR9-BEl0seAzTGGkM7TJcNu_QQ52DLg',
  CAT:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Dk4wk2yuYh9FGKezVz-srnzE9mSUwqOai5zQ_nCJn-oDkXqvEcig78uYwwt_mhHaXlkRPu2IKTEqrtFm3WGBzUE9ZgUb2u96nQ7L2bC-7zmrTOhK9PODtIOOiJfkt9hqdeMJlnsFg26OVoPKXLWouJncv3wHyiaR8pQunxupCMhekvPQZA_KtueCUyYM_KGOrIMmmOfgkro04qTDtU5BWUUfIJAgFoVU4BjXMcVjrAD_ZuNMixd1XI8aZEggCqwjxxanGFTI28w',
  AVATAR_FEMALE:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCkiOFiTi418p8IKf49VIXi-xRx55HQW5pFsUUBsMvhU6AtFtWPV9eGhZCtYYrNyqqOU1GZnqrfyBT2LSSXP1GFL4kAaRRIGBzmWnvdfjlRz26ccoGLymKSu5mo6WfhSDvMO3jZ1Y6DsU6oJLLD6L8feg3dLMsddgJGY27ygvYlC1abagVkInwNVTzxlt5MaRHHxUxQ0_F1ng4mJGM2RuOMdyBRGg9Ank7TPS-Sk3w3LKj3Xajs0GTdv_a3o8rRWEfXZ4gb7HDcU70',
  AVATAR_MALE:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCAGuEzkFscZWbxj5OYYpWmKYJGngA6v043C6G9slOXrZqO8jl66DexnbMr22ihq7WEsTnmf1xWkou8LtqTzmgr4YXqUrFuIJpeRa6wv5rXXtDdZyQh0byOqeGzhvIqf1KZEw2J9lRbsz8BzmXjwfc7UkKjEvQIMiBp0gQ5kKC6Ujxdexf7h2nmm3SKW0XXj1ckK94BbgaV3K37jwRhCXqAwaaci1zUMeBl5qlVjz88IqNnzn5MBqmEEZTkyopiiHBUB54xQf1pB8I',
  TRIP_BLUE:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBR72KXiO_7okq4I9kiQAqYocSa7AbqM2NiTbY7QDfDI0arz3R2sQKYPfQtHSqFabKCtlDQAtIRRddyVcR0cua98uPH0lztGieDuxbOgfDL90E_ZVzr7c9S2p54V8HZDXmWy14N7dIR72cpqtRAwRka1LxwD5Nh6ulzx1mIMKTAYM0exfpXWzvlCy-ApXuvgNg45WmZlE1dessU9bVeJs1UapxRq1u2pBL6WLRQLdLd3kPX9beeaylqeYkOOKyVN2xetWy71cpMb90',
};

export const MEMORIES: Memory[] = [
  { id: '1', title: '第一次约会', date: '2021-10-12', image: IMAGES.COFFEE, rotation: '-rotate-1' },
  { id: '2', title: '海边的一天', date: '2022-08-22', image: IMAGES.BEACH, rotation: 'rotate-2' },
  { id: '3', title: '搬新家', date: '2023-03-15', image: IMAGES.MOVING, rotation: '-rotate-1' },
  { id: '4', title: '看演唱会', date: '2023-11-01', image: IMAGES.CONCERT, rotation: 'rotate-1' },
  { id: '5', title: '周末野餐', date: '2024-04-06', image: IMAGES.PICNIC, rotation: '-rotate-2' },
  { id: '6', title: 'Luna 到家', date: '2024-10-03', image: IMAGES.CAT, rotation: 'rotate-1' },
];

export const EVENTS: AnniversaryEvent[] = [
  {
    id: '1',
    title: '恋爱纪念日',
    subtitle: '值得庆祝的日子',
    date: '2022-02-14',
    type: '纪念日',
    image: IMAGES.COFFEE,
  },
  {
    id: '2',
    title: '生日',
    subtitle: '别忘了准备蛋糕',
    date: '2026-09-28',
    type: '生日',
  },
  {
    id: '3',
    title: '夏日旅行计划',
    subtitle: '一起去看海',
    date: '2026-07-01',
    type: '旅行',
    image: IMAGES.TRIP_BLUE,
  },
];

