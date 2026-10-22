export default function ServiceIllustration({ kind }: { kind: 'strength' | 'coaching' | 'recovery' }) {
  return (
    <svg viewBox="0 0 320 220" fill="none" aria-hidden="true" className="thrive-service-illustration">
      <g stroke="currentColor" strokeWidth=".7" opacity=".12">
        <path d="m45 161 115-66 115 66-115 66zM70 147l115 66M95 132l115 66M120 118l115 66M210 122 95 188M235 136l-115 66M185 108 70 188" />
      </g>
      <g stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round">
        <path d="m62 155 98-56 98 56-98 57z" fill="currentColor" fillOpacity=".025" />
        <path d="M62 155v13l98 57 98-57v-13M160 212v13" opacity=".4" />
        {kind === 'strength' && <>
          <path d="m80 127 80-46 80 46-80 46zM80 127v12l80 46 80-46v-12M160 173v12" opacity=".5" />
          <path d="m96 100 64-37 64 37-64 37zM96 100v12l64 37 64-37v-12M160 137v12" opacity=".65" />
          <path d="m113 75 47-27 47 27-47 27zM113 75v11l47 27 47-27V75M160 102v11" />
          <path d="m137 73 39 22M136 65l-8 14 12 7 8-14zM172 86l-8 14 12 7 8-14z" className="thrive-service-accent" strokeWidth="2" />
          <path d="M160 149v13M160 185v12" className="thrive-service-accent" strokeDasharray="2 4" />
        </>}
        {kind === 'coaching' && <>
          <path d="m113 59 47-27 47 27-47 27zM113 59v12l47 27 47-27V59M160 86v12" />
          <path d="m91 124 28-16 28 16-28 16zM91 124v10l28 16 28-16v-10M119 140v10m54-26 28-16 28 16-28 16zM173 124v10l28 16 28-16v-10M201 140v10" opacity=".7" />
          <path d="M160 100v17m-41-7 41-24 41 24M119 153v21l41 24 41-24v-21" className="thrive-service-accent" />
          <circle cx="160" cy="58" r="8" className="thrive-service-accent" />
          <circle cx="119" cy="124" r="3" className="thrive-service-accent" fill="currentColor" />
          <circle cx="201" cy="124" r="3" className="thrive-service-accent" fill="currentColor" />
        </>}
        {kind === 'recovery' && <>
          <ellipse cx="160" cy="127" rx="109" ry="49" strokeDasharray="3 6" opacity=".5" />
          <path d="m113 99 47-27 47 27-47 27zM113 99v12l47 27 47-27V99M160 126v12" />
          <path d="m125 58 35-20 35 20-35 20zM125 58v10l35 20 35-20V58M160 78v10" opacity=".6" />
          <path d="M160 141v24m-22-67h12l6-11 9 23 7-12h12" className="thrive-service-accent" strokeWidth="2" />
          <circle cx="51" cy="127" r="3" className="thrive-service-accent" fill="currentColor" />
          <circle cx="269" cy="127" r="3" className="thrive-service-accent" fill="currentColor" />
          <circle cx="160" cy="176" r="3" className="thrive-service-accent" fill="currentColor" />
        </>}
      </g>
    </svg>
  );
}
