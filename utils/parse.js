const fs = require('fs')

const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('../data/raw/data.csv')
})

const stateReader = require('readline').createInterface({
  input: require('fs').createReadStream('../data/raw/TotalState.csv')
})

const STATE_DICT = {
  Alabama: 'AL',
  Arkansas: 'AR',
  Alaska: 'AK',
  Arizona: 'AZ',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  'District of Columbia': 'DC',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY'
}

const DATA = {}
const COLUMNS = []

let lineCount = 0

lineReader.on('line', (line) => {
  const current = line.split(',')

  if (lineCount === 0) {
    // header
    let columnIndex = 0
    current.slice(2).forEach((e) => {
      e = strip(e)

      COLUMNS[columnIndex] = e

      columnIndex++
    })
  } else {
    const key = strip(current[0])
    const year = current[1]

    if (
      key === 'Police Protection Expenditure' ||
      key === 'Hospital Expenditure' ||
      key === 'Health Expenditure'
    ) {
      let columnIndex = 0
      current.slice(4).forEach((e) => {
        const location = COLUMNS[columnIndex].split(':').map((v) => v.trim())

        if (location) {
          const city = location[1]
          const state = location[0]

          DATA[state] = DATA[state] ? DATA[state] : {}
          DATA[state][city] = DATA[state][city] ? DATA[state][city] : {}
          DATA[state][city][year] = DATA[state][city][year]
            ? DATA[state][city][year]
            : {}

          DATA[state][city][year][key] = Number(e)

          columnIndex++
        }
      })
    }
  }

  lineCount++
})

let currentYear = '0000'
stateReader.on('line', (line) => {
  console.log(currentYear)
  if (line.substring(0, 3) === '***') {
    currentYear = line.replace('***', '')
  } else {
    const current = line.split(',').map((v) => v.trim())

    if (STATE_DICT[current[0]]) {
      // valid state
      const state = STATE_DICT[current[0]]

      DATA[state] = DATA[state] ? DATA[state] : {}
      DATA[state]['Total'] = DATA[state]['Total'] ? DATA[state]['Total'] : {}
      DATA[state]['Total'][currentYear] = {}

      DATA[state]['Total'][currentYear]['Health and Hospitals'] = current[7]
      DATA[state]['Total'][currentYear]['Police Protection Expenditure'] =
        current[9]
    }
  }
})

const crimeReader = require('readline').createInterface({
  input: require('fs').createReadStream('../data/raw/CrimeStatebyState.csv')
})

let currentState = 'XX'
const CRIME_DATA = {}

crimeReader.on('line', (line) => {
  if (line.substring(0, 3) === '***') {
    currentState = STATE_DICT[line.replace('***Estimated crime in ', '')]
    CRIME_DATA[currentState] = {}
  } else {
    if (line.length !== 0) {
      d = line.split(',').map((v) => v.trim())

      if (!isNaN(Number(d[0]))) {
        const year = d[0]
        const crimeRate = d[8] // per 100k pop

        CRIME_DATA[currentState][year] = crimeRate
      }
    }
  }
})

crimeReader.on('close', () => {
  fs.writeFileSync('crime.json', JSON.stringify(CRIME_DATA))
})

lineReader.on('close', () => {})

const strip = (s) => {
  return s.replace(/"/g, '')
}

setTimeout(() => {
  fs.writeFileSync('spendingData.json', JSON.stringify(DATA))
}, 10000)
