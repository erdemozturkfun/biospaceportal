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

const ENVIRONMENTS = ["Takeoff", "Orbit", "Moon Surface", "Mars surface"];
const CATEGORIES = ["Experiment", "Organism", "Pathway", "Stressor", "Result", "Environment"];

function colorFor(node: any) {
  return 0x5ca3ff;
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

async function mockFetchGraph(query: string, yearRange: number[], filter: string) {
  const year = (yearRange[0] + '-' + yearRange[1])
  const params = new URLSearchParams({ query, year, filter });

  const res = await fetch(`https://35.209.14.138.nip.io/graph?${params.toString()}`)

  return await res.json();
}

export default function KnowledgeGraphExplorer3D() {
  const fgRef = useRef<any>();
  const [query, setQuery] = useState("");
  const [question, setQuestion] = useState("")
  const [allGraph, setAllGraph] = useState<any>({ nodes: [], links: [] });
  const [filteredGraph, setFilteredGraph] = useState<any>({ nodes: [], links: [] });
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [nodeScale, setNodeScale] = useState(4);
  const [qaResults, setQAResults] = useState<string[]>([]);
  const [showQAPopup, setShowQAPopup] = useState(false);

  // Filter states
  const [yearRange, setYearRange] = useState<number[]>([2019, 2025]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(ENVIRONMENTS);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(CATEGORIES);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setFilteredGraph(await mockFetchGraph("cosmic radiation", [2019, 2025], "Takeoff,Orbit,Moon Surface"))

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


  async function handleSearch(ev?: React.FormEvent) {
    ev?.preventDefault();
    if (!query || query.trim().length < 2) return;
    setLoading(true);

    const g = await mockFetchGraph(query, yearRange, selectedEnvironments.join(','));
    setFilteredGraph(g);
    setSelected(null);
    setLoading(false);
    setTimeout(() => fgRef.current?.zoomToFit(400), 150);
  }
  async function handleQA(ev?: React.FormEvent) {
    ev?.preventDefault();
    if (!question || question.trim().length < 2) return;
    setLoading(true);
    // Example fetch, adjust URL and params as needed
    const res = await fetch(`https://35.209.14.138.nip.io/summary?query=${encodeURIComponent(question)}&year=${yearRange[0]}-${yearRange[1]}&filter=${encodeURIComponent(selectedEnvironments.join(','))}`);
    const data = await res.json();
    setQAResults(data); // assuming data is a list of strings
    setShowQAPopup(true);
    setLoading(false);
  }
  async function handleReset() {
    setLoading(true);
    const g = await mockFetchGraph("microgravity", [2013, 2025], "Takeoff,Orbit,Moon Surface,Mars");
    setFilteredGraph(g);
    setSelected(null);
    setQuery("");
    setYearRange([2013, 2025]);
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
    if (!node) return
    console.log(node)
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
    const geom = new THREE.SphereGeometry(nodeScale * 1, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: colorFor(node),
      emissive: 0x072534,
      roughness: 0.7,
      metalness: 0.1
    });
    group.add(new THREE.Mesh(geom, mat));

    const sprite = new SpriteText(shortText(node.title, 40)) as any;
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
                  min={1950}
                  max={2025}
                  step={1}
                  value={yearRange}
                  onValueChange={setYearRange}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1950</span>
                  <span>2025</span>
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


            </Card>

            <form onSubmit={handleQA} className="flex gap-2 items-center ml-4">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Ara: 'kemik erimesi', 'radius', 'microgravity'..."
                className="border border-border rounded-lg px-4 py-2 w-40 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
              />
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-smooth"
                disabled={loading}
              >
                Search
              </Button>

            </form>

            {showQAPopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-card p-8 rounded-lg shadow-lg max-w-3xl w-[700px] min-h-[200px] flex flex-col">
                  <h2 className="text-lg font-semibold mb-4">QA Results</h2>
                  <ul className="mb-4 overflow-y-auto max-h-[60vh]">
                    {qaResults.map((item, idx) => (
                      <li key={idx} className="mb-2 text-foreground">{item}</li>
                    ))}
                  </ul>
                  <div className="flex justify-end">
                    <Button onClick={() => setShowQAPopup(false)}>Close</Button>
                  </div>
                </div>
              </div>
            )}
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
              No selected node
            </div>
          )}
          {selected && (
            <Card className="p-4 bg-secondary/30 border-border space-y-4">
              <div>
                <h3 className="font-medium text-lg text-foreground mb-2">{selected.paper_id}</h3>
                <div className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                  {selected.title}
                </div>
              </div>

              {selected.url && (
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-2">Full Article</h4>
                  <Link to={selected.url} className="text-sm font-light text-sky-600  ">Link to PubMedCentral</Link>
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
