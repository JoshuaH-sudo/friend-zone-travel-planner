import { FC, PropsWithChildren } from 'react';

const WordFrame: FC<PropsWithChildren> = ({ children }) => (
  <div className='inline-flex items-center justify-center gap-2.5 rounded-xl p-3 outline-dashed outline-[3px] outline-offset-[-3px] outline-pink-950'>
    <div
      className="justify-start text-center font-['Roboto'] text-6xl font-extrabold leading-[64px] text-white [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]"
      style={{
        WebkitTextStrokeWidth: '3px',
        WebkitTextStrokeColor: '#30002B',
        paintOrder: 'stroke fill',
        fontWeight: '800',
      }}
    >
      {children}
    </div>
  </div>
);

export default WordFrame;
