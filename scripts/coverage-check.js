#!/usr/bin/env node

/**
 * Coverage Check Script
 *
 * This script is used to check coverage thresholds and track coverage trends over time.
 * It can be used in CI/CD pipelines to enforce coverage requirements and monitor changes.
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_DIR = path.join(__dirname, '..', 'coverage');
const COVERAGE_SUMMARY_FILE = path.join(COVERAGE_DIR, 'coverage-summary.json');
const COVERAGE_HISTORY_FILE = path.join(COVERAGE_DIR, 'coverage-history.json');

// Coverage thresholds matching jest.config.js
const THRESHOLDS = {
  global: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
};

function readCoverageSummary() {
  if (!fs.existsSync(COVERAGE_SUMMARY_FILE)) {
    console.error(
      'Coverage summary not found. Run "npm run test:coverage" first.'
    );
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(COVERAGE_SUMMARY_FILE, 'utf8'));
}

function updateCoverageHistory(summary) {
  let history = [];

  if (fs.existsSync(COVERAGE_HISTORY_FILE)) {
    history = JSON.parse(fs.readFileSync(COVERAGE_HISTORY_FILE, 'utf8'));
  }

  const timestamp = new Date().toISOString();
  const metrics = summary.total;

  history.push({
    timestamp,
    branches: metrics.branches.pct,
    functions: metrics.functions.pct,
    lines: metrics.lines.pct,
    statements: metrics.statements.pct,
  });

  // Keep only last 30 entries
  if (history.length > 30) {
    history = history.slice(-30);
  }

  fs.writeFileSync(COVERAGE_HISTORY_FILE, JSON.stringify(history, null, 2));

  return history;
}

function calculateTrend(history) {
  if (history.length < 2) {
    return null;
  }

  const current = history[history.length - 1];
  const previous = history[history.length - 2];

  return {
    branches: current.branches - previous.branches,
    functions: current.functions - previous.functions,
    lines: current.lines - previous.lines,
    statements: current.statements - previous.statements,
  };
}

function formatTrendSymbol(value) {
  if (value > 0) return `↑ +${value.toFixed(2)}%`;
  if (value < 0) return `↓ ${value.toFixed(2)}%`;
  return '→ 0.00%';
}

function checkCoverage() {
  const summary = readCoverageSummary();
  const metrics = summary.total;
  const history = updateCoverageHistory(summary);
  const trend = calculateTrend(history);

  console.log('\n📊 Coverage Report\n');
  console.log('┌─────────────┬──────────┬──────────┬─────────────┐');
  console.log('│ Metric      │ Coverage │ Threshold│ Trend       │');
  console.log('├─────────────┼──────────┼──────────┼─────────────┤');

  let failed = false;

  Object.keys(THRESHOLDS.global).forEach((metric) => {
    const value = metrics[metric].pct;
    const threshold = THRESHOLDS.global[metric];
    const passed = value >= threshold;
    const status = passed ? '✅' : '❌';
    const trendValue = trend ? trend[metric] : 0;
    const trendSymbol = trend ? formatTrendSymbol(trendValue) : 'N/A';

    if (!passed) failed = true;

    console.log(
      `│ ${status} ${metric.padEnd(9)} │ ${value.toFixed(2).padStart(7)}% │ ${threshold.toFixed(0).padStart(7)}% │ ${trendSymbol.padEnd(11)} │`
    );
  });

  console.log('└─────────────┴──────────┴──────────┴─────────────┘');

  if (failed) {
    console.log('\n❌ Coverage thresholds not met!\n');
    process.exit(1);
  } else {
    console.log('\n✅ All coverage thresholds met!\n');

    // Coverage quality metrics
    const avgCoverage =
      (metrics.branches.pct +
        metrics.functions.pct +
        metrics.lines.pct +
        metrics.statements.pct) /
      4;

    console.log('📈 Coverage Quality Metrics:');
    console.log(`   • Average Coverage: ${avgCoverage.toFixed(2)}%`);
    console.log(`   • Uncovered Lines: ${metrics.lines.uncovered}`);
    console.log(`   • Uncovered Branches: ${metrics.branches.uncovered}`);

    // Quality ratings
    if (avgCoverage >= 95) {
      console.log('   • Quality Rating: ⭐⭐⭐⭐⭐ Excellent');
    } else if (avgCoverage >= 90) {
      console.log('   • Quality Rating: ⭐⭐⭐⭐ Very Good');
    } else if (avgCoverage >= 80) {
      console.log('   • Quality Rating: ⭐⭐⭐ Good');
    } else {
      console.log('   • Quality Rating: ⭐⭐ Needs Improvement');
    }

    // Show coverage quality insights
    const branchCoverage = metrics.branches.pct;
    if (branchCoverage < 95) {
      console.log(
        '\n💡 Tip: Consider improving branch coverage for better test quality.'
      );
      console.log('   Focus on testing edge cases and error scenarios.');
    }

    // Show files with lowest coverage
    const fileCoverage = Object.entries(summary)
      .filter(([key]) => key !== 'total')
      .map(([file, data]) => ({
        file,
        coverage:
          (data.lines.pct +
            data.branches.pct +
            data.functions.pct +
            data.statements.pct) /
          4,
      }))
      .sort((a, b) => a.coverage - b.coverage)
      .slice(0, 3);

    if (fileCoverage.length > 0 && fileCoverage[0].coverage < 100) {
      console.log('\n🎯 Files needing attention:');
      fileCoverage.forEach(({ file, coverage }) => {
        if (coverage < 100) {
          console.log(`   • ${file}: ${coverage.toFixed(2)}%`);
        }
      });
    }

    console.log('');
  }
}

// Run the check
checkCoverage();
