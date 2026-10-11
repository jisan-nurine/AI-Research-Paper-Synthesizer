export interface KeyContribution {
  title: string;
  description: string;
  noveltyScore: number;
  evidenceQuote: string;
}

export interface Methodology {
  architectureOverview: string;
  mathematicalFormulation: string;
  datasets: string[];
  experimentalSetup: string;
  pipelineSteps: string[];
}

export interface Limitation {
  category: string;
  description: string;
  severity: 'Low' | 'Moderate' | 'Critical';
  potentialMitigation: string;
}

export interface FutureWork {
  area: string;
  hypothesis: string;
  horizon: 'Immediate' | 'Medium-term' | 'Long-term' | string;
}

export interface Benchmark {
  metric: string;
  result: string;
  baseline: string;
  improvement: string;
}

export interface PaperIntelligence {
  id: string;
  fileName: string;
  title: string;
  authors: string[];
  venueYear: string;
  doi: string;
  field: string;
  executiveSummary: string;
  breakthroughScore: number;
  keyContributions: KeyContribution[];
  methodology: Methodology;
  limitations: Limitation[];
  futureWork: FutureWork[];
  benchmarks: Benchmark[];
  taxonomies: string[];
  analyzedAt: string;
  originalText?: string;
  pageCount?: number;
}

export interface PaperComparisonMatrixItem {
  dimension: string;
  paperAssessments: {
    paperTitle: string;
    assessment: string;
  }[];
  winnerOrVerdict: string;
}

export interface ComparativeSynthesis {
  comparativeSynthesis: string;
  divergenceSummary: string;
  matrix: PaperComparisonMatrixItem[];
  conflictingAssumptions: string[];
  sharedVulnerabilities: string[];
  synergiesAndHybridPotential: string;
  executiveRecommendation: string;
}

export interface ScienceLiteratureResult {
  source: string;
  id: string;
  pmid?: string;
  doi?: string;
  title: string;
  authorString?: string;
  journalTitle?: string;
  pubYear?: number;
  citedByCount?: number;
  isOpenAccess?: boolean;
  abstractText?: string;
  url: string;
}
