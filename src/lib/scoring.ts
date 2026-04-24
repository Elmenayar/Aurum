import { Broker, Lead } from '../types';

export interface ScoringWeights {
  registration: number;
  communication: number;
  closure: number;
  vip: number;
}

export interface BrokerScoringDetails {
  totalScore: number;
  registrationCompleteness: number;
  communicationFrequency: number;
  dealClosureRate: number;
  vipStatus: number;
}

export const calculateBrokerScore = (
  broker: Broker, 
  allLeads: Lead[], 
  weights: ScoringWeights = { registration: 25, communication: 25, closure: 25, vip: 25 }
): BrokerScoringDetails => {
  const brokerLeads = allLeads.filter(l => l.brokerId === broker.id);
  
  // 1. Registration Completeness (Max weights.registration points)
  let registrationBase = 0;
  if (broker.brokerName) registrationBase += 1;
  if (broker.companyName) registrationBase += 1;
  if (broker.email) registrationBase += 1;
  if (broker.phone) registrationBase += 1;
  if (broker.websiteUrl || broker.linkedinUrl || broker.twitterUrl) registrationBase += 1;
  
  const registrationScore = Math.round((registrationBase / 5) * weights.registration);

  // 2. Communication Frequency (Max weights.communication points)
  const logCount = broker.logs?.length || 0;
  let communicationBase = 0;
  if (logCount >= 6) communicationBase = 1;
  else if (logCount >= 3) communicationBase = 0.8;
  else if (logCount >= 1) communicationBase = 0.4;
  
  const communicationScore = Math.round(communicationBase * weights.communication);

  // 3. Deal Closure Rate (Max weights.closure points)
  let closureScore = 0;
  if (brokerLeads.length > 0) {
    const closedLeads = brokerLeads.filter(l => l.status === 'closed').length;
    closureScore = Math.round((closedLeads / brokerLeads.length) * weights.closure);
  }

  // 4. VIP Status (Max weights.vip points)
  const vipScore = broker.status === 'VIP' ? weights.vip : 0;

  return {
    totalScore: registrationScore + communicationScore + closureScore + vipScore,
    registrationCompleteness: registrationScore,
    communicationFrequency: communicationScore,
    dealClosureRate: closureScore,
    vipStatus: vipScore,
  };
};
