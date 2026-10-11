import { PaperIntelligence } from '../types/research';

export const SAMPLE_PAPERS: PaperIntelligence[] = [
  {
    id: 'sample-alphafold2',
    fileName: 'nature_alphafold2_jumper2021.pdf',
    title: 'Highly accurate protein structure prediction with AlphaFold',
    authors: ['John Jumper', 'Richard Evans', 'Alexander Pritzel', 'Tim Green', 'Michael Figurnov', 'Demis Hassabis'],
    venueYear: 'Nature, Vol 596 (2021)',
    doi: '10.1038/s41586-021-03819-2',
    field: 'Structural Biology & Computational Biochemistry',
    executiveSummary: 'AlphaFold demonstrates atomic-accuracy 3D protein structure prediction directly from primary amino acid sequences, solving the 50-year-old protein folding grand challenge with experimental crystallographic parity on CASP14 targets.',
    breakthroughScore: 99,
    keyContributions: [
      {
        title: 'Evoformer Multi-Track Representation Learning',
        description: 'Jointly transforms Multiple Sequence Alignment (MSA) representations and pairwise residue-residue spatial geometries through axial attention and triangular update operations.',
        noveltyScore: 98,
        evidenceQuote: 'The Evoformer blocks enable direct, continuous co-evolutionary communication between pairwise residue spatial geometry and evolutionary MSA information without intermediate contact discretization.'
      },
      {
        title: 'Invariant Coordinate Frame Representation (IPA)',
        description: 'Direct 3D backbone frame parameterization (rigid body rotations SO(3) and translations R3) using Invariant Point Attention rather than post-hoc gradient descent or fragment assembly.',
        noveltyScore: 97,
        evidenceQuote: 'Invariant point attention operates directly on atomic coordinate frames without coordinate system reference bias, producing explicit 3D atomic coordinates.'
      },
      {
        title: 'Calibrated Confidence Metrics (pLDDT & PAE)',
        description: 'End-to-end prediction of per-residue local distance difference test (pLDDT) and pairwise Predicted Aligned Error (PAE) matrices to quantify domain orientation confidence.',
        noveltyScore: 95,
        evidenceQuote: 'AlphaFold outputs well-calibrated confidence estimates across all residues, distinguishing ordered folded domains from intrinsically disordered regions.'
      }
    ],
    methodology: {
      architectureOverview: '48-block Evoformer module executing axial self-attention and triangle inequality updates, coupled to an 8-block Structure Module with Invariant Point Attention and frame-aligned point loss (FAPE).',
      mathematicalFormulation: 'Loss = L_FAPE + L_distogram + L_pLDDT + L_masked_MSA + L_torsion; Triangle multiplicative updates: Y_ij = sum_k (A_ik * B_jk) enforcing geometric transitivity.',
      datasets: ['Protein Data Bank (PDB) ~170,000 structures', 'UniRef90', 'BFD (Big Fantastic Database)', 'MGnify metagenomics'],
      experimentalSetup: 'Trained on 128 TPUv3 cores for approximately 11 days with sequence crop length 256, followed by fine-tuning on crop length 384.',
      pipelineSteps: [
        'Genetic database search across UniRef90, BFD, and MGnify to construct MSA',
        'Template search in PDB70',
        '48 Evoformer block multi-track iterations (MSA track and Pair representation)',
        '3D Structure Module iterative frame refinement with recycling (3-4 iterations)',
        'AMBER force-field relaxation for stereochemical clash resolution'
      ]
    },
    limitations: [
      {
        category: 'Dynamic Conformations',
        description: 'Predominantly predicts single static ground-state conformations rather than allosteric state ensembles or kinetic transition pathways.',
        severity: 'Moderate',
        potentialMitigation: 'MSA subsampling or generative diffusion conditioned on physical microenvironment states.'
      },
      {
        category: 'Cofactors & Ligands',
        description: 'Excludes nucleic acids, post-translational modifications (PTMs), metal ions, and small-molecule drug ligands in early iterations.',
        severity: 'Moderate',
        potentialMitigation: 'Multi-modal conditioning on chemical SMILES and coordinate priors (extended in AlphaFold 3).'
      },
      {
        category: 'Orphan Sequences',
        description: 'Reduced accuracy on designed de novo proteins or evolutionary orphan genes lacking deep natural MSAs.',
        severity: 'Critical',
        potentialMitigation: 'Single-sequence protein language model embeddings (e.g., ESMFold).'
      }
    ],
    futureWork: [
      {
        area: 'Multiprotein Complex Stoichiometry',
        hypothesis: 'Extension of paired MSA alignment across interacting genomic operons to resolve quaternary hetero-oligomeric assemblies.',
        horizon: 'Immediate (6-12m)'
      },
      {
        area: 'Drug Binding Affinity & Pocket Screening',
        hypothesis: 'Joint end-to-end folding with small molecule docking to replace molecular dynamics free energy perturbation.',
        horizon: 'Medium-term (1-3y)'
      }
    ],
    benchmarks: [
      {
        metric: 'CASP14 Median Backbone GDT-TS',
        result: '92.4',
        baseline: '61.5 (CASP13 state-of-the-art)',
        improvement: '+50.2% accuracy leap'
      },
      {
        metric: 'All-atom RMSD (95% of residues)',
        result: '0.96 Å',
        baseline: '2.80 Å',
        improvement: '65.7% reduction in coordinate error'
      }
    ],
    taxonomies: ['Structural Biology', 'AlphaFold', 'Protein Folding', 'Evoformer', 'CASP14', 'Deep Learning'],
    analyzedAt: '2026-10-10T20:15:00Z',
    pageCount: 38
  },
  {
    id: 'sample-attention',
    fileName: 'neurips_attention_is_all_you_need_2017.pdf',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
    venueYear: 'NeurIPS 2017',
    doi: '10.48550/arXiv.1706.03762',
    field: 'Natural Language Processing & Foundation Models',
    executiveSummary: 'Introduces the Transformer, discarding recurrent and convolutional architectures in favor of purely attention-based mechanisms that enable unprecedented parallelization and long-range dependency modeling.',
    breakthroughScore: 98,
    keyContributions: [
      {
        title: 'Scaled Dot-Product & Multi-Head Self-Attention',
        description: 'Maps queries and key-value pairs through projection heads allowing the model to jointly attend to information from different representation subspaces at different positions.',
        noveltyScore: 99,
        evidenceQuote: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions without recurrence.'
      },
      {
        title: 'Non-Recurrent Sequence Parallelization',
        description: 'Eliminates sequential recurrence O(n) execution path, enabling full training parallelism across entire sequences on tensor processing hardware.',
        noveltyScore: 97,
        evidenceQuote: 'Within the Transformer, the number of operations to connect signals from two arbitrary input or output positions is reduced to a constant O(1).'
      },
      {
        title: 'Sinusoidal Positional Encoding',
        description: 'Injects geometric relative distance awareness into permutation-invariant attention matrices using trigonometric frequency harmonics.',
        noveltyScore: 93,
        evidenceQuote: 'We use sine and cosine functions of different frequencies to allow the model to easily learn to attend by relative positions.'
      }
    ],
    methodology: {
      architectureOverview: 'Encoder-decoder stack of 6 identical layers each consisting of multi-head self-attention and position-wise fully connected feed-forward networks with residual connections and layer normalization.',
      mathematicalFormulation: 'Attention(Q,K,V) = softmax(Q K^T / sqrt(d_k)) V; MultiHead(Q,K,V) = Concat(head_1, ..., head_h) W^O; PE_(pos, 2i) = sin(pos/10000^(2i/d_model))',
      datasets: ['WMT 2014 English-to-German (4.5 million sentence pairs)', 'WMT 2014 English-to-French (36 million sentence pairs)'],
      experimentalSetup: 'Trained on 8 NVIDIA P100 GPUs for 3.5 days (Transformer-big) using Adam optimizer with warmup and inverted square-root schedule.',
      pipelineSteps: [
        'Byte-Pair Encoding (BPE) subword tokenization',
        'Token and sinusoidal positional embeddings summation',
        'Encoder multi-head attention + LayerNorm residual feedforward processing',
        'Decoder masked multi-head causal self-attention + cross-attention over encoder states',
        'Linear projection and Softmax next-token distribution generation'
      ]
    },
    limitations: [
      {
        category: 'Quadratic Computational Complexity',
        description: 'Attention matrix computation scales quadratically O(N^2) in memory and compute with sequence length N, constraining long-context inputs.',
        severity: 'Critical',
        potentialMitigation: 'Linear attention, flash attention, sparse windowing, or state space models (Mamba).'
      },
      {
        category: 'Lack of Inductive Bias for Local Spatial Topologies',
        description: 'Lacks spatial translation invariance intrinsic to convolutions, requiring massive data to infer local geometry.',
        severity: 'Moderate',
        potentialMitigation: 'Hybrid convolutional-attention tokenizers or hierarchical spatial patches (Swin).'
      }
    ],
    futureWork: [
      {
        area: 'Universal Cross-Modal Foundation Models',
        hypothesis: 'Applying transformer architecture directly to image patches, protein sequences, audio spectrograms, and reinforcement learning trajectories.',
        horizon: 'Immediate (6-12m)'
      },
      {
        area: 'Sub-Quadratic Long Context Scaling',
        hypothesis: 'Replacing dense softmax attention with recurrence or state space formulations for million-token horizons.',
        horizon: 'Medium-term (1-3y)'
      }
    ],
    benchmarks: [
      {
        metric: 'WMT 2014 English-to-German BLEU',
        result: '28.4',
        baseline: '26.4 (ByteNet / ConvS2S)',
        improvement: '+2.0 BLEU points at fraction of training cost'
      },
      {
        metric: 'WMT 2014 English-to-French BLEU',
        result: '41.8',
        baseline: '40.5',
        improvement: '+1.3 BLEU establishing new world benchmark'
      }
    ],
    taxonomies: ['Transformers', 'Self-Attention', 'NLP', 'Parallel Computing', 'Deep Learning'],
    analyzedAt: '2026-10-10T19:40:00Z',
    pageCount: 15
  },
  {
    id: 'sample-resnet',
    fileName: 'cvpr_deep_residual_learning_he2016.pdf',
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    venueYear: 'CVPR 2016 (Best Paper Award)',
    doi: '10.1109/CVPR.2016.90',
    field: 'Computer Vision & Deep Architectures',
    executiveSummary: 'Formulates residual skip-connection learning, resolving the degradation problem and enabling training of networks exceeding 100 to 1,000 layers without vanishing/exploding gradients.',
    breakthroughScore: 97,
    keyContributions: [
      {
        title: 'Residual Mapping Formulation: F(x) + x',
        description: 'Reformulates neural layer stacks to fit a residual mapping F(x) := H(x) - x rather than the unreferenced original mapping H(x), enabling identity gradient highway propagation.',
        noveltyScore: 98,
        evidenceQuote: 'We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions.'
      },
      {
        title: 'Resolution of the Degradation Paradox',
        description: 'Demonstrates that deeper networks degrade not due to overfitting but due to optimization difficulty, which identity shortcuts eliminate.',
        noveltyScore: 96,
        evidenceQuote: 'With residual learning, deeper models achieve significantly lower training errors than their shallower counterparts.'
      }
    ],
    methodology: {
      architectureOverview: 'Deep residual network (ResNet-50, ResNet-101, ResNet-152) constructed with bottleneck residual blocks consisting of 1x1, 3x3, and 1x1 convolutions with parameter-free identity shortcuts.',
      mathematicalFormulation: 'y = F(x, {W_i}) + x; F = W_2 * sigma(W_1 * x); Identity mapping ensures dLoss/dx = dLoss/dy * (dF/dx + I)',
      datasets: ['ImageNet 2012 classification (1.28M training, 50k validation images)', 'COCO Object Detection', 'PASCAL VOC'],
      experimentalSetup: 'Trained on 8 GPUs using SGD with batch size 256, momentum 0.9, weight decay 0.0001, and batch normalization before activation.',
      pipelineSteps: [
        'Initial 7x7 conv with stride 2 and max pooling',
        'Stack of 4 stages of bottleneck residual blocks with stride 2 downsampling',
        'Global average pooling layer',
        '1000-way fully connected softmax classification'
      ]
    },
    limitations: [
      {
        category: 'Feature Reuse Redundancy',
        description: 'Later layers exhibit representational diminishing returns, with many residual blocks acting as ensemble perturbations rather than novel feature extractors.',
        severity: 'Moderate',
        potentialMitigation: 'Dense cross-layer concatenations (DenseNet) or stochastic depth regularization.'
      }
    ],
    futureWork: [
      {
        area: 'Ultra-Deep Scaling & Dense Connectivity',
        hypothesis: 'Dense feature reuse where every layer receives concatenated inputs from all previous layers.',
        horizon: 'Immediate (6-12m)'
      }
    ],
    benchmarks: [
      {
        metric: 'ImageNet Top-5 Error Rate (ResNet-152)',
        result: '3.57%',
        baseline: '6.67% (GoogLeNet / VGG)',
        improvement: 'Surpassed human-level vision performance (5.1%)'
      }
    ],
    taxonomies: ['ResNet', 'Computer Vision', 'Residual Learning', 'Deep Architecture'],
    analyzedAt: '2026-10-10T18:00:00Z',
    pageCount: 28
  }
];
