import React, { useEffect, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import '@fontsource/space-grotesk';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORY_COLORS = {
  Experiment: 0x1f77b4,
  Organism: 0xff7f0e,
  Pathway: 0x2ca02c,
  Stressor: 0xd62728,
  Result: 0x9467bd,
  Environment: 0xe377c2
};

const ENVIRONMENTS = ["Pre-flight", "Mid-flight", "Lunar surface", "Martian surface"];
const CATEGORIES = ["Experiment", "Organism", "Pathway", "Stressor", "Result", "Environment"];

function colorFor(node: any) {
  return CATEGORY_COLORS[node.type as keyof typeof CATEGORY_COLORS] || 0x7f7f7f;
}

function shortText(t: string, n = 140) {
  if (!t) return "";
  return t.length > n ? t.slice(0, n) + "..." : t;
}

async function mockSemanticSearch(query: string) {
  await new Promise((r) => setTimeout(r, 300));
  const lower = query.toLowerCase();
  if (lower.includes("kemik") || lower.includes("osteoporo") || lower.includes("bone")) {
    return ["exp1", "org_mouse", "path_bone_remodeling", "env_lunar_surface"];
  }
  if (lower.includes("radius") || lower.includes("radia")) {
    return ["exp3", "stressor_radiation", "org_zebrafish", "env_martian_surface"];
  }
  return ["exp2", "org_rat", "path_inflammation", "env_mid_flight"];
}

async function mockFetchGraph(nodeIds: string[] = []) {
  await new Promise((r) => setTimeout(r, 300));
  const nodes = [
    { id: "exp1", name: "Exp: Microgravity bone density (2021)", type: "Experiment", meta: { year: 2021 }, environment: "Lunar surface" },
    { id: "exp2", name: "Exp: High-salt diet inflammation (2019)", type: "Experiment", meta: { year: 2019 }, environment: "Mid-flight" },
    { id: "exp3", name: "Exp: Ionizing radiation on development (2020)", type: "Experiment", meta: { year: 2020 }, environment: "Martian surface" },
    { id: "org_mouse", name: "Mus musculus (mouse)", type: "Organism" },
    { id: "org_rat", name: "Rattus norvegicus (rat)", type: "Organism" },
    { id: "org_zebrafish", name: "Danio rerio (zebrafish)", type: "Organism" },
    { id: "path_bone_remodeling", name: "Pathway: Bone remodeling", type: "Pathway" },
    { id: "path_inflammation", name: "Pathway: NF-kB inflammation", type: "Pathway" },
    { id: "stressor_microgravity", name: "Microgravity", type: "Stressor" },
    { id: "stressor_radiation", name: "Ionizing radiation", type: "Stressor" },
    { id: "result_decrease_bone", name: "Result: decreased trabecular bone", type: "Result" },
    { id: "result_increased_markers", name: "Result: increased inflammatory markers", type: "Result" },
    { id: "env_pre_flight", name: "Pre-flight", type: "Environment" },
    { id: "env_mid_flight", name: "Mid-flight", type: "Environment" },
    { id: "env_lunar_surface", name: "Lunar surface", type: "Environment" },
    { id: "env_martian_surface", name: "Martian surface", type: "Environment" }
  ];

  const links = [
    { source: "stressor_microgravity", target: "exp1", rel: "applied_in" },
    { source: "exp1", target: "org_mouse", rel: "performed_on" },
    { source: "exp1", target: "path_bone_remodeling", rel: "affects" },
    { source: "exp1", target: "result_decrease_bone", rel: "observed" },
    { source: "exp1", target: "env_lunar_surface", rel: "environment" },

    { source: "exp2", target: "org_rat", rel: "performed_on" },
    { source: "exp2", target: "path_inflammation", rel: "affects" },
    { source: "exp2", target: "result_increased_markers", rel: "observed" },
    { source: "exp2", target: "env_mid_flight", rel: "environment" },

    { source: "stressor_radiation", target: "exp3", rel: "applied_in" },
    { source: "exp3", target: "org_zebrafish", rel: "performed_on" },
    { source: "exp3", target: "path_bone_remodeling", rel: "affects" },
    { source: "exp3", target: "env_martian_surface", rel: "environment" }
  ];

  if (!nodeIds || nodeIds.length === 0) return { nodes, links };

  const included = new Set<string>();
  for (const id of nodeIds) {
    included.add(id);
    for (const l of links) {
      if (l.source === id) included.add(l.target);
      if (l.target === id) included.add(l.source);
    }
  }
  return { 
    nodes: nodes.filter(n => included.has(n.id)), 
    links: links.filter(l => included.has(l.source as string) && included.has(l.target as string)) 
  };
}

export default function KnowledgeGraphExplorer3D() {
  const fgRef = useRef<any>();
  const [query, setQuery] = useState("");
  const [allGraph, setAllGraph] = useState<any>({ nodes: [], links: [] });
  const [filteredGraph, setFilteredGraph] = useState<any>({ nodes: [], links: [] });
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [nodeScale, setNodeScale] = useState(4);
  
  // Filter states
  const [yearRange, setYearRange] = useState<number[]>([2019, 2021]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(ENVIRONMENTS);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(CATEGORIES);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const g = await mockFetchGraph([]);
      setAllGraph(g);
      setFilteredGraph(g);
      setLoading(false);
    })();
  }, []);

  // Configure controls for scroll-based zoom and middle-click pan
  useEffect(() => {
    const configureControls = () => {
      const controls = fgRef.current?.controls();
      if (controls) {
        // Enable middle mouse button (scroll button) for panning
        controls.mouseButtons = {
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.PAN
        };
      }
    };

    // Wait for ForceGraph3D to initialize
    const timer = setTimeout(configureControls, 100);
    return () => clearTimeout(timer);
  }, [filteredGraph]);

  // Apply filters whenever filter state changes
  useEffect(() => {
    if (!allGraph.nodes || allGraph.nodes.length === 0) return;

    const filteredNodes = allGraph.nodes.filter((node: any) => {
      // Category filter
      if (!selectedCategories.includes(node.type)) return false;

      // Year filter for experiments
      if (node.type === "Experiment" && node.meta?.year) {
        if (node.meta.year < yearRange[0] || node.meta.year > yearRange[1]) {
          return false;
        }
      }

      // Environment filter
      if (node.environment && !selectedEnvironments.includes(node.environment)) {
        return false;
      }

      return true;
    });

    const nodeIds = new Set(filteredNodes.map((n: any) => n.id));
    const filteredLinks = allGraph.links.filter((link: any) => 
      nodeIds.has(link.source.id || link.source) && nodeIds.has(link.target.id || link.target)
    );

    setFilteredGraph({ nodes: filteredNodes, links: filteredLinks });
  }, [yearRange, selectedEnvironments, selectedCategories, allGraph]);

  async function handleSearch(ev?: React.FormEvent) {
    ev?.preventDefault();
    if (!query || query.trim().length < 2) return;
    setLoading(true);
    const ids = await mockSemanticSearch(query);
    const g = await mockFetchGraph(ids);
    setAllGraph(g);
    setSelected(null);
    setLoading(false);
    setTimeout(() => fgRef.current?.zoomToFit(400), 150);
  }

  async function handleReset() {
    setLoading(true);
    const g = await mockFetchGraph([]);
    setAllGraph(g);
    setSelected(null);
    setQuery("");
    setYearRange([2019, 2021]);
    setSelectedEnvironments(ENVIRONMENTS);
    setSelectedCategories(CATEGORIES);
    setLoading(false);
  }

  function handleZoomIn() {
    const camera = fgRef.current?.camera();
    if (camera) {
      camera.position.multiplyScalar(0.8);
      camera.updateProjectionMatrix();
    }
  }

  function handleZoomOut() {
    const camera = fgRef.current?.camera();
    if (camera) {
      camera.position.multiplyScalar(1.2);
      camera.updateProjectionMatrix();
    }
  }

  function handleResetView() {
    fgRef.current?.cameraPosition(
      { x: 0, y: 0, z: 300 },
      { x: 0, y: 0, z: 0 },
      1000
    );
  }

  function handleFitView() {
    setTimeout(() => fgRef.current?.zoomToFit(1000), 100);
  }

  function handleNodeClick(node: any) {
    setSelected(node);
    const distance = 100;
    const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
    fgRef.current?.cameraPosition(
      { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
      { x: node.x || 0, y: node.y || 0, z: node.z || 0 },
      400
    );
  }

  function nodeThreeObject(node: any) {
    const group = new THREE.Group();
    const geom = new THREE.SphereGeometry(nodeScale * (node.type === 'Experiment' ? 1.2 : 1), 16, 16);
    const mat = new THREE.MeshStandardMaterial({ 
      color: colorFor(node), 
      emissive: 0x072534, 
      roughness: 0.7, 
      metalness: 0.1 
    });
    group.add(new THREE.Mesh(geom, mat));

    const sprite = new SpriteText(shortText(node.name, 40)) as any;
    sprite.color = '#ffffff';
    sprite.textHeight = 3.5;
    sprite.fontFace = 'Space Grotesk';
    sprite.position.set(0, nodeScale + 2, 0);
    group.add(sprite);

    return group;
  }

  function toggleEnvironment(env: string) {
    setSelectedEnvironments(prev => 
      prev.includes(env) 
        ? prev.filter(e => e !== env)
        : [...prev, env]
    );
  }

  function toggleCategory(cat: string) {
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  }

  // Calculate graph statistics
  function calculateStats() {
    const nodeDegrees = new Map<string, number>();
    
    // Calculate degree for each node
    filteredGraph.nodes.forEach((node: any) => {
      nodeDegrees.set(node.id, 0);
    });

    filteredGraph.links.forEach((link: any) => {
      const sourceId = link.source.id || link.source;
      const targetId = link.target.id || link.target;
      nodeDegrees.set(sourceId, (nodeDegrees.get(sourceId) || 0) + 1);
      nodeDegrees.set(targetId, (nodeDegrees.get(targetId) || 0) + 1);
    });

    // Find top connected nodes
    const sortedByDegree = Array.from(nodeDegrees.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, degree]) => ({
        node: filteredGraph.nodes.find((n: any) => n.id === id),
        degree
      }));

    // Calculate average degree
    const avgDegree = nodeDegrees.size > 0 
      ? Array.from(nodeDegrees.values()).reduce((a, b) => a + b, 0) / nodeDegrees.size 
      : 0;

    return {
      topConnected: sortedByDegree,
      avgDegree: avgDegree.toFixed(2),
      totalNodes: filteredGraph.nodes.length,
      totalLinks: filteredGraph.links.length
    };
  }

  const stats = calculateStats();

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <Button asChild variant="ghost" size="sm" className="mr-2">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Knowledge Graph Explorer 3D
        </h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 items-center ml-4">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ara: 'kemik erimesi', 'radius', 'microgravity'..."
            className="border border-border rounded-lg px-4 py-2 w-96 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
          />
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-smooth" 
            disabled={loading}
          >
            Search
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={handleReset}
            className="border-border hover:bg-secondary/50 transition-smooth"
          >
            Reset
          </Button>
        </form>

        <div className="ml-auto flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="transition-smooth"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <label className="text-sm text-muted-foreground">Node size</label>
          <input 
            type="range" 
            min={1} 
            max={12} 
            value={nodeScale} 
            onChange={e => setNodeScale(Number(e.target.value))}
            className="w-24 accent-primary"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Filters Panel */}
        {showFilters && (
          <aside className="min-w-[320px] w-[320px] flex-shrink-0 border-r border-border bg-card p-6 overflow-y-auto space-y-6">
            <div>
              <h3 className="font-semibold text-xl mb-6 text-foreground">Filters</h3>
              
              {/* Year Range Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block text-foreground">
                  Year Range: {yearRange[0]} - {yearRange[1]}
                </Label>
                <Slider
                  min={2019}
                  max={2021}
                  step={1}
                  value={yearRange}
                  onValueChange={setYearRange}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>2019</span>
                  <span>2021</span>
                </div>
              </div>

              {/* Environment Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block text-foreground">Environment</Label>
                <div className="space-y-3">
                  {ENVIRONMENTS.map(env => (
                    <div key={env} className="flex items-center space-x-3">
                      <Checkbox
                        id={env}
                        checked={selectedEnvironments.includes(env)}
                        onCheckedChange={() => toggleEnvironment(env)}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={env}
                        className="text-sm cursor-pointer text-foreground hover:text-primary transition-smooth flex-1"
                      >
                        {env}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block text-foreground">Categories</Label>
                <div className="space-y-3">
                  {CATEGORIES.map(cat => (
                    <div key={cat} className="flex items-center space-x-3">
                      <Checkbox
                        id={cat}
                        checked={selectedCategories.includes(cat)}
                        onCheckedChange={() => toggleCategory(cat)}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={cat}
                        className="text-sm cursor-pointer text-foreground hover:text-primary transition-smooth flex-1"
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistics Panel */}
            <Card className="p-4 bg-secondary/30 border-border space-y-4">
              <div>
                <h4 className="font-semibold text-base text-foreground mb-3">Graph Statistics</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Nodes:</span>
                    <span className="font-medium text-foreground">{stats.totalNodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Links:</span>
                    <span className="font-medium text-foreground">{stats.totalLinks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Connections:</span>
                    <span className="font-medium text-foreground">{stats.avgDegree}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <h5 className="font-medium text-sm text-foreground mb-2">Top Connected Nodes</h5>
                <div className="space-y-2">
                  {stats.topConnected.map(({ node, degree }: any, idx: number) => (
                    <div 
                      key={node.id}
                      className="flex items-start gap-2 text-xs cursor-pointer hover:bg-secondary/50 p-2 rounded transition-smooth"
                      onClick={() => handleNodeClick(node)}
                    >
                      <span className="text-primary font-bold min-w-[20px]">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate">{node.name}</p>
                        <p className="text-muted-foreground text-xs">{degree} connections</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </aside>
        )}

        {/* 3D Graph */}
        <div className="flex-1 h-full relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="text-primary text-lg font-medium animate-pulse">Loading...</div>
            </div>
          )}
          
          {/* Camera Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <Card className="p-2 bg-card/90 backdrop-blur-sm border-border">
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomIn}
                  className="w-10 h-10 p-0 hover:bg-primary/20"
                  title="Zoom In"
                >
                  <span className="text-lg">+</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleZoomOut}
                  className="w-10 h-10 p-0 hover:bg-primary/20"
                  title="Zoom Out"
                >
                  <span className="text-lg">−</span>
                </Button>
                <div className="h-px bg-border my-1"></div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleFitView}
                  className="w-10 h-10 p-0 hover:bg-primary/20 text-xs"
                  title="Fit to View"
                >
                  ⊡
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetView}
                  className="w-10 h-10 p-0 hover:bg-primary/20 text-xs"
                  title="Reset View"
                >
                  ⟲
                </Button>
              </div>
            </Card>
          </div>
          <ForceGraph3D
            ref={fgRef}
            graphData={filteredGraph}
            nodeThreeObject={nodeThreeObject}
            linkThreeObject={() => null}
            onNodeClick={handleNodeClick}
            linkOpacity={0.6}
            linkWidth={() => 1}
            backgroundColor="#0d0d0d"
            enableNavigationControls={true}
            enableNodeDrag={false}
            controlType="orbit"
            showNavInfo={false}
          />
        </div>

        {/* Details Panel */}
        <aside className="min-w-[320px] w-[320px] flex-shrink-0 border-l border-border bg-card/30 backdrop-blur-sm p-4 overflow-y-auto">
          <h2 className="font-semibold text-lg mb-4 text-primary">Details</h2>
          {!selected && (
            <div className="text-sm text-muted-foreground">
              Seçili düğüm yok. Bir düğüme tıklayın veya arama yapın.
            </div>
          )}
          {selected && (
            <Card className="p-4 bg-secondary/30 border-border space-y-4">
              <div>
                <h3 className="font-medium text-lg text-foreground mb-2">{selected.name}</h3>
                <div className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                  {selected.type}
                </div>
              </div>
              
              {selected.meta && Object.keys(selected.meta).length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-2">Metadata</h4>
                  <pre className="text-xs bg-background/50 p-3 rounded-lg border border-border overflow-auto">
                    {JSON.stringify(selected.meta, null, 2)}
                  </pre>
                </div>
              )}

              {selected.environment && (
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-2">Environment</h4>
                  <p className="text-sm text-muted-foreground">{selected.environment}</p>
                </div>
              )}
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
