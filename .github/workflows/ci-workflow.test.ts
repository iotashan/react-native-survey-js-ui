import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('CI Workflow Configuration', () => {
  const workflowPath = path.join(__dirname, '../../.github/workflows/ci.yml');

  it('should have a valid CI workflow file', () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
  });

  it('should have correct workflow structure', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    // Verify basic workflow structure
    expect(workflow.name).toBe('CI');
    expect(workflow.on).toBeDefined();
    expect(workflow.jobs).toBeDefined();
  });

  it('should trigger on pull requests and main branch pushes', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    // Verify triggers
    expect(workflow.on.push.branches).toContain('main');
    expect(workflow.on.pull_request).toBeDefined();
  });

  it('should have library test job with all required steps', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    const testJob = workflow.jobs['test-library'];
    expect(testJob).toBeDefined();
    
    // Verify required steps exist
    const stepNames = testJob.steps.map((step: any) => step.name);
    expect(stepNames).toContain('Checkout code');
    expect(stepNames).toContain('Setup');
    expect(stepNames).toContain('Run TypeScript check');
    expect(stepNames).toContain('Run linting');
    expect(stepNames).toContain('Run library tests');
    expect(stepNames).toContain('Upload coverage reports');
  });

  it('should have example app test job', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    const exampleJob = workflow.jobs['test-example'];
    expect(exampleJob).toBeDefined();
    
    // Verify example app test steps
    const stepNames = exampleJob.steps.map((step: any) => step.name);
    expect(stepNames).toContain('Run example app tests');
  });

  it('should have build verification job', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    const buildJob = workflow.jobs['build-library'];
    expect(buildJob).toBeDefined();
    
    // Verify build steps
    const stepNames = buildJob.steps.map((step: any) => step.name);
    expect(stepNames).toContain('Build library');
    expect(stepNames).toContain('Validate build output');
  });

  it('should use proper caching for dependencies', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    // Check that at least one job uses caching via setup action
    const testJob = workflow.jobs['test-library'];
    const setupStep = testJob.steps.find((step: any) => 
      step.uses?.includes('.github/actions/setup') || step.name === 'Setup'
    );
    expect(setupStep).toBeDefined();
  });

  it('should have timeout settings to prevent hanging', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    // Check that jobs have timeout settings
    const jobsWithTimeout = Object.values(workflow.jobs).filter((job: any) => 
      job['timeout-minutes'] !== undefined
    );
    expect(jobsWithTimeout.length).toBeGreaterThan(0);
    jobsWithTimeout.forEach((job: any) => {
      expect(job['timeout-minutes']).toBeLessThanOrEqual(30);
    });
  });

  it('should preserve test artifacts', () => {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    // Check for artifact upload in test job
    const testJob = workflow.jobs['test-library'];
    const artifactStep = testJob.steps.find((step: any) => 
      step.uses?.includes('actions/upload-artifact')
    );
    expect(artifactStep).toBeDefined();
  });
});