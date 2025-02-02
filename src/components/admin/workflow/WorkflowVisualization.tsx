// src/components/admin/workflow/WorkflowVisualization.tsx -->

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkflow } from '@/hooks/useWorkflow';
import { Workflow } from '@/lib/ai/workflow/types';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  status: string;
  type: 'step' | 'agent';
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  type: 'dependency' | 'agent';
}

interface WorkflowVisualizationProps {
  workflowId: string;
}

export function WorkflowVisualization({ workflowId }: WorkflowVisualizationProps) {
  const { workflow, isLoading, error } = useWorkflow(workflowId);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!workflow || !svgRef.current) return;

    const nodes: Node[] = createNodes(workflow);
    const links: Link[] = createLinks(workflow);

    renderGraph(svgRef.current, nodes, links);
  }, [workflow]);

  if (isLoading) {
    return <Skeleton className="w-full h-[600px]" />;
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500">Error loading workflow visualization</div>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}

function createNodes(workflow: Workflow): Node[] {
  const nodes: Node[] = [];

  // Add step nodes
  workflow.steps?.forEach(step => {
    nodes.push({
      id: step.id,
      label: step.id,
      status: step.status,
      type: 'step'
    });
  });

  // Add agent nodes
  const agents = new Set(workflow.steps?.map(step => step.agentId) ?? []);
  agents.forEach(agentId => {
    if (agentId) { // Add null check
      nodes.push({
        id: `agent-${agentId}`,
        label: agentId,
        status: 'active',
        type: 'agent'
      });
    }
  });

  return nodes;
}

function createLinks(workflow: Workflow): Link[] {
  const links: Link[] = [];

  // Add dependency links
  workflow.steps?.forEach(step => {
    step.dependencies?.forEach(depId => {
      links.push({
        source: depId,
        target: step.id,
        type: 'dependency'
      });
    });

    // Add agent links
    if (step.agentId) {
      links.push({
        source: step.id,
        target: `agent-${step.agentId}`,
        type: 'agent'
      });
    }
  });

  return links;
}

function renderGraph(svg: SVGSVGElement, nodes: Node[], links: Link[]) {
  const width = svg.clientWidth;
  const height = svg.clientHeight;

  // Clear previous rendering
  d3.select(svg).selectAll('*').remove();

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(50));

  const g = d3.select(svg)
    .append('g');

  // Add zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event: { transform: any; }) => {
      g.attr('transform', event.transform);
    });

  d3.select(svg).call(zoom as any);

  // Create arrow marker
  g.append('defs').selectAll('marker')
    .data(['dependency', 'agent'])
    .enter().append('marker')
    .attr('id', d => `arrow-${d}`)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', d => d === 'dependency' ? '#999' : '#666');

  // Draw links
  const link = g.append('g')
    .selectAll('line')
    .data(links)
    .enter().append('line')
    .attr('stroke', d => d.type === 'dependency' ? '#999' : '#666')
    .attr('stroke-width', 2)
    .attr('marker-end', d => `url(#arrow-${d.type})`);

  // Draw nodes
  const node = g.append('g')
    .selectAll('g')
    .data(nodes)
    .enter().append('g')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended) as any
    );

  // Add circles for nodes
  node.append('circle')
    .attr('r', 20)
    .attr('fill', d => getNodeColor(d.status, d.type));

  // Add labels
  node.append('text')
    .text(d => d.label)
    .attr('text-anchor', 'middle')
    .attr('dy', 30)
    .attr('class', 'text-xs');

  // Update positions on simulation tick
  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    node
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
  });

  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
}

function getNodeColor(status: string, type: string): string {
  if (type === 'agent') return '#4B5563';
  
  switch (status) {
    case 'completed':
      return '#10B981';
    case 'running':
      return '#3B82F6';
    case 'failed':
      return '#EF4444';
    case 'pending':
      return '#9CA3AF';
    default:
      return '#6B7280';
  }
} 