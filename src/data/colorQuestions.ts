export interface ColorOption {
  id: string
  color: 'red' | 'yellow' | 'green' | 'blue'
  textKey: string
}

export interface ColorQuestion {
  id: number
  titleKey: string
  categoryKey: string
  options: ColorOption[]
}

export const COLOR_QUESTIONS: ColorQuestion[] = [
  {
    id: 1,
    categoryKey: 'categories.decision_making',
    titleKey: 'q1.title',
    options: [
      { id: '1_red', color: 'red', textKey: 'q1.red' },
      { id: '1_yellow', color: 'yellow', textKey: 'q1.yellow' },
      { id: '1_green', color: 'green', textKey: 'q1.green' },
      { id: '1_blue', color: 'blue', textKey: 'q1.blue' }
    ]
  },
  {
    id: 2,
    categoryKey: 'categories.communication',
    titleKey: 'q2.title',
    options: [
      { id: '2_yellow', color: 'yellow', textKey: 'q2.yellow' },
      { id: '2_red', color: 'red', textKey: 'q2.red' },
      { id: '2_blue', color: 'blue', textKey: 'q2.blue' },
      { id: '2_green', color: 'green', textKey: 'q2.green' }
    ]
  },
  {
    id: 3,
    categoryKey: 'categories.stress_management',
    titleKey: 'q3.title',
    options: [
      { id: '3_green', color: 'green', textKey: 'q3.green' },
      { id: '3_red', color: 'red', textKey: 'q3.red' },
      { id: '3_yellow', color: 'yellow', textKey: 'q3.yellow' },
      { id: '3_blue', color: 'blue', textKey: 'q3.blue' }
    ]
  },
  {
    id: 4,
    categoryKey: 'categories.work_style',
    titleKey: 'q4.title',
    options: [
      { id: '4_blue', color: 'blue', textKey: 'q4.blue' },
      { id: '4_green', color: 'green', textKey: 'q4.green' },
      { id: '4_red', color: 'red', textKey: 'q4.red' },
      { id: '4_yellow', color: 'yellow', textKey: 'q4.yellow' }
    ]
  },
  {
    id: 5,
    categoryKey: 'categories.problem_solving',
    titleKey: 'q5.title',
    options: [
      { id: '5_red', color: 'red', textKey: 'q5.red' },
      { id: '5_blue', color: 'blue', textKey: 'q5.blue' },
      { id: '5_green', color: 'green', textKey: 'q5.green' },
      { id: '5_yellow', color: 'yellow', textKey: 'q5.yellow' }
    ]
  },
  {
    id: 6,
    categoryKey: 'categories.teamwork',
    titleKey: 'q6.title',
    options: [
      { id: '6_yellow', color: 'yellow', textKey: 'q6.yellow' },
      { id: '6_green', color: 'green', textKey: 'q6.green' },
      { id: '6_red', color: 'red', textKey: 'q6.red' },
      { id: '6_blue', color: 'blue', textKey: 'q6.blue' }
    ]
  },
  {
    id: 7,
    categoryKey: 'categories.motivation',
    titleKey: 'q7.title',
    options: [
      { id: '7_red', color: 'red', textKey: 'q7.red' },
      { id: '7_yellow', color: 'yellow', textKey: 'q7.yellow' },
      { id: '7_blue', color: 'blue', textKey: 'q7.blue' },
      { id: '7_green', color: 'green', textKey: 'q7.green' }
    ]
  },
  {
    id: 8,
    categoryKey: 'categories.conflict_resolution',
    titleKey: 'q8.title',
    options: [
      { id: '8_green', color: 'green', textKey: 'q8.green' },
      { id: '8_yellow', color: 'yellow', textKey: 'q8.yellow' },
      { id: '8_blue', color: 'blue', textKey: 'q8.blue' },
      { id: '8_red', color: 'red', textKey: 'q8.red' }
    ]
  },
  {
    id: 9,
    categoryKey: 'categories.decision_making',
    titleKey: 'q9.title',
    options: [
      { id: '9_blue', color: 'blue', textKey: 'q9.blue' },
      { id: '9_red', color: 'red', textKey: 'q9.red' },
      { id: '9_yellow', color: 'yellow', textKey: 'q9.yellow' },
      { id: '9_green', color: 'green', textKey: 'q9.green' }
    ]
  },
  {
    id: 10,
    categoryKey: 'categories.communication',
    titleKey: 'q10.title',
    options: [
      { id: '10_yellow', color: 'yellow', textKey: 'q10.yellow' },
      { id: '10_green', color: 'green', textKey: 'q10.green' },
      { id: '10_red', color: 'red', textKey: 'q10.red' },
      { id: '10_blue', color: 'blue', textKey: 'q10.blue' }
    ]
  },
  {
    id: 11,
    categoryKey: 'categories.work_style',
    titleKey: 'q11.title',
    options: [
      { id: '11_green', color: 'green', textKey: 'q11.green' },
      { id: '11_blue', color: 'blue', textKey: 'q11.blue' },
      { id: '11_red', color: 'red', textKey: 'q11.red' },
      { id: '11_yellow', color: 'yellow', textKey: 'q11.yellow' }
    ]
  },
  {
    id: 12,
    categoryKey: 'categories.stress_management',
    titleKey: 'q12.title',
    options: [
      { id: '12_red', color: 'red', textKey: 'q12.red' },
      { id: '12_yellow', color: 'yellow', textKey: 'q12.yellow' },
      { id: '12_green', color: 'green', textKey: 'q12.green' },
      { id: '12_blue', color: 'blue', textKey: 'q12.blue' }
    ]
  },
  {
    id: 13,
    categoryKey: 'categories.problem_solving',
    titleKey: 'q13.title',
    options: [
      { id: '13_blue', color: 'blue', textKey: 'q13.blue' },
      { id: '13_green', color: 'green', textKey: 'q13.green' },
      { id: '13_yellow', color: 'yellow', textKey: 'q13.yellow' },
      { id: '13_red', color: 'red', textKey: 'q13.red' }
    ]
  },
  {
    id: 14,
    categoryKey: 'categories.teamwork',
    titleKey: 'q14.title',
    options: [
      { id: '14_yellow', color: 'yellow', textKey: 'q14.yellow' },
      { id: '14_red', color: 'red', textKey: 'q14.red' },
      { id: '14_blue', color: 'blue', textKey: 'q14.blue' },
      { id: '14_green', color: 'green', textKey: 'q14.green' }
    ]
  },
  {
    id: 15,
    categoryKey: 'categories.motivation',
    titleKey: 'q15.title',
    options: [
      { id: '15_green', color: 'green', textKey: 'q15.green' },
      { id: '15_red', color: 'red', textKey: 'q15.red' },
      { id: '15_yellow', color: 'yellow', textKey: 'q15.yellow' },
      { id: '15_blue', color: 'blue', textKey: 'q15.blue' }
    ]
  },
  {
    id: 16,
    categoryKey: 'categories.conflict_resolution',
    titleKey: 'q16.title',
    options: [
      { id: '16_red', color: 'red', textKey: 'q16.red' },
      { id: '16_blue', color: 'blue', textKey: 'q16.blue' },
      { id: '16_green', color: 'green', textKey: 'q16.green' },
      { id: '16_yellow', color: 'yellow', textKey: 'q16.yellow' }
    ]
  }
]
