import type { SVGProps } from 'react';

export interface MarsMiraLogoProps extends SVGProps<SVGSVGElement> {
  withBackdrop?: boolean;
}

export const MarsMiraLogo = ({
  className = 'h-10 w-10',
  withBackdrop = true,
  ...props
}: MarsMiraLogoProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      {...props}
    >
      {/* Clean rounded backdrop */}
      {withBackdrop && (
        <rect width="512" height="512" rx="112" fill="#FFFFFF" />
      )}

      {/* Centered Srebrenica flower with 11 petals */}
      <g transform="translate(256, 256)">
        {/* 11 Crisp petals with clean black/deep-slate outlines for high pop and contrast */}
        <g stroke="#0F172A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path transform="rotate(0)" d="M -20 -52 C -35 -95, -32 -160, 0 -185 C 32 -160, 35 -95, 20 -52" fill="#FFFFFF" />
          <path transform="rotate(32.727)" d="M -20 -52 C -35 -95, -32 -160, 0 -185 C 32 -160, 35 -95, 20 -52" fill="#FFFFFF" />
          <path transform="rotate(65.455)" d="M -20 -52 C -35 -95, -32 -160, 0 -185 C 32 -160, 35 -95, 20 -52" fill="#FFFFFF" />
          <path transform="rotate(98.182)" d="M -20 -52 C -35 -95, -32 -160, 0 -185 C 32 -160, 35 -95, 20 -52" fill="#FFFFFF" />
          <path transform="rotate(130.909)" d="M -20 -52 C -35 -95, -32 -160, 0 -185 C 32 -160, 35 -95, 20 -52" fill="#FFFFFF" />
          <path transform="rotate(163.636)" d="M -20 -52 C -35 -95, -32 -160, 0 -185 C 32 -160, 35 -95, 20 -52" fill="#FFFFFF" />
          <path transform="rotate(196.364)" d="M -20 -52 C -35 -95, -32 -160, 0 -185 C 32 -160, 35 -95, 20 -52" fill="#FFFFFF" />
          <path transform="rotate(229.091)" d="M -20 -52 C -35 -95, -32 -160, 0 -185 C 32 -160, 35 -95, 20 -52" fill="#FFFFFF" />
          <path transform="rotate(261.818)" d="M -20 -52 C -35 -95, -32 -160, 0 -185 C 32 -160, 35 -95, 20 -52" fill="#FFFFFF" />
          <path transform="rotate(294.545)" d="M -20 -52 C -35 -95, -32 -160, 0 -185 C 32 -160, 35 -95, 20 -52" fill="#FFFFFF" />
          <path transform="rotate(327.273)" d="M -20 -52 C -35 -95, -32 -160, 0 -185 C 32 -160, 35 -95, 20 -52" fill="#FFFFFF" />
        </g>

        {/* Center emerald disc with crisp clean definition */}
        <circle cx="0" cy="0" r="58" fill="#10B981" stroke="#0F172A" strokeWidth="4.5" />

        {/* Peaceful walker in a gentle, dignified stroll */}
        {/* Head upright */}
        <circle cx="1" cy="-26" r="7.5" fill="#FFFFFF" />

        {/* Upright, relaxed torso with gentle forward posture */}
        <path d="M 0 -17 L -1 3 L 0 8" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Gentle small daypack on back */}
        <path d="M -2 -14 C -7 -14, -8 -6, -3 -2" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Legs in natural, easy walking stride */}
        <path d="M 0 8 L 6 18 L 8 28" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M 0 8 L -6 18 L -9 27" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Arms in natural, relaxed swing */}
        <path d="M -1 -12 L 5 -3 L 8 4" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M -1 -12 L -7 -3 L -10 5" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
};
