import React from 'react';

import {Card, Count, Eyebrow, Rise} from '../components/Card';
import {Flame, Steps} from '../components/Icons';
import {C, SERIF} from '../theme';

// 53.18 "fat loss" · 54.42 "4,000 steps" · 55.98 "roughly" · 56.48 "150 calories a day"
const IN = 54.15;
const OUT = 58.2;

export const G7FatLoss: React.FC = () => {
  return (
    <Card inAt={IN} outAt={OUT} top={236} width={900} height={262}>
      <div style={{padding: '36px 50px 0'}}>
        <Rise at={IN + 0.1}>
          <Eyebrow>For fat loss</Eyebrow>
        </Rise>
        <div style={{display: 'flex', alignItems: 'flex-end', marginTop: 20}}>
          <div>
            <Rise at={54.35} style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Steps size={46} />
              <span style={{fontSize: 84, fontWeight: 800, letterSpacing: -3.4, lineHeight: 1}}>
                +<Count at={54.42} to={4000} dur={0.7} />
              </span>
            </Rise>
            <Rise at={54.95} style={{fontSize: 29, fontWeight: 600, color: C.inkSoft, marginTop: 10, marginLeft: 60}}>
              extra steps
            </Rise>
          </div>
          <Rise at={55.9} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 72, color: C.inkFaint, padding: '0 34px 46px', lineHeight: 1}}>
            ≈
          </Rise>
          <div>
            <Rise at={56.4} style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <Flame size={46} />
              <span style={{fontSize: 84, fontWeight: 800, letterSpacing: -3.4, lineHeight: 1, color: C.accent}}>
                <Count at={56.48} to={150} dur={0.6} />
              </span>
            </Rise>
            <Rise at={57.1} style={{fontSize: 29, fontWeight: 600, color: C.inkSoft, marginTop: 10, marginLeft: 58}}>
              calories a day
            </Rise>
          </div>
        </div>
      </div>
    </Card>
  );
};
