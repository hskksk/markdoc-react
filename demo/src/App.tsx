import cytoscape from 'cytoscape'
import * as echarts from 'echarts'
import vegaEmbed from 'vega-embed'
import {
  MarkdocReader,
  createChartRenderer,
  createCytoscapeGraphHandler,
  createEChartsChartHandler,
  createGraphRenderer,
  createMockMinimapLabeler,
  createVegaLiteChartHandler,
} from '@hskksk/markdoc-react'

const minimapLabeler = createMockMinimapLabeler()

const chartRenderer = createChartRenderer({
  echarts: createEChartsChartHandler(echarts),
  'vega-lite': createVegaLiteChartHandler(vegaEmbed),
})

const graphRenderer = createGraphRenderer({
  cytoscape: createCytoscapeGraphHandler(cytoscape),
})

const source = `
# Analytics playbook

This sample doc is intentionally **deep**: scroll the main column or use the minimap on the right to jump between sections. Labels come from the mock AI labeler (block kinds appear after the middle dot).

{% callout type="tip" %}
The minimap builds sections from headings only. More levels below mean more segments and clearer active-state changes while you scroll.
{% /callout %}

## 1. Growth metrics

Product signups and retention snapshots for the last two quarters.

### 1.1 Signup trend

Monthly totals rendered with ECharts.

#### January–June line chart

{% chart engine="echarts" height="340" %}
\`\`\`json
{
  "tooltip": { "trigger": "axis" },
  "xAxis": {
    "type": "category",
    "data": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  },
  "yAxis": { "type": "value" },
  "series": [
    {
      "name": "Signups",
      "type": "line",
      "smooth": true,
      "areaStyle": { "opacity": 0.15 },
      "data": [820, 932, 901, 934, 1290, 1330]
    }
  ]
}
\`\`\`
{% /chart %}

### 1.2 Funnel notes

{% details summary="How to read the chart" %}
Hover points for exact values. The mock data is static; the minimap should still highlight this subsection when it scrolls into view.
{% /details %}

Paragraph filler so this section has height: teams often compare **week 4** against **week 1** when reviewing campaigns. Repeat the scroll test here—the active minimap row should move from the chart block to this heading cluster.

## 2. Team allocation

Where engineering hours went last sprint.

### 2.1 Hours by team

Vega-Lite bar chart.

#### Docs, API, SDK, Support

{% chart engine="vega-lite" height="320" %}
\`\`\`json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "Sample bar chart",
  "data": {
    "values": [
      { "category": "Docs", "hours": 28 },
      { "category": "API", "hours": 55 },
      { "category": "SDK", "hours": 43 },
      { "category": "Support", "hours": 91 }
    ]
  },
  "mark": { "type": "bar", "cornerRadiusEnd": 4 },
  "encoding": {
    "x": { "field": "category", "type": "nominal", "title": "Team" },
    "y": { "field": "hours", "type": "quantitative", "title": "Hours" },
    "color": { "field": "category", "type": "nominal", "legend": null }
  }
}
\`\`\`
{% /chart %}

### 2.2 Takeaways

Support led hours this sprint. Scroll past this subsection before jumping to architecture—the minimap should list **at least eight** section rows when fully expanded.

## 3. Runtime architecture

How requests flow through production services.

### 3.1 Service graph

Cytoscape layout of the default topology.

#### Nodes and edges

{% graph engine="cytoscape" height="380" %}
\`\`\`json
{
  "elements": [
    { "data": { "id": "web", "label": "Web" } },
    { "data": { "id": "api", "label": "API" } },
    { "data": { "id": "worker", "label": "Worker" } },
    { "data": { "id": "db", "label": "DB" } },
    { "data": { "id": "cache", "label": "Cache" } },
    { "data": { "source": "web", "target": "api" } },
    { "data": { "source": "api", "target": "worker" } },
    { "data": { "source": "api", "target": "cache" } },
    { "data": { "source": "worker", "target": "db" } }
  ],
  "layout": { "name": "cose", "animate": false },
  "style": [
    {
      "selector": "node",
      "style": {
        "label": "data(label)",
        "text-valign": "center",
        "color": "#e7ecf3",
        "background-color": "#3b82f6",
        "width": 56,
        "height": 56,
        "font-size": 11
      }
    },
    {
      "selector": "edge",
      "style": {
        "width": 2,
        "line-color": "#64748b",
        "target-arrow-color": "#64748b",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier"
      }
    }
  ]
}
\`\`\`
{% /graph %}

### 3.2 Operations checklist

{% callout type="warning" %}
Click **Nodes and edges** in the minimap after scrolling to the top—you should land directly on the graph block.
{% /callout %}

## 4. Appendix

### 4.1 Glossary

Short definitions to add scroll depth.

#### Minimap

A parse-only outline rail; no transform pass required.

#### MarkdocReader

Wraps \`MarkdocView\` plus the minimap in a two-column layout.

### 4.2 Changelog

- Added hierarchical demo headings for minimap QA.
- Kept chart and graph tags under nested \`h3\` / \`h4\` titles.
`

export function App() {
  return (
    <div className="demo-page">
      <h1>@hskksk/markdoc-react — minimap + viz demo</h1>
      <p className="demo-lede">
        Deep Markdoc outline on the left (scroll inside the panel). Use the minimap to jump across h2–h4 sections; charts stay under nested headings.
      </p>
      <MarkdocReader
        source={source}
        chartRenderer={chartRenderer}
        graphRenderer={graphRenderer}
        theme="dark"
        minimap={{ labeler: minimapLabeler }}
      />
    </div>
  )
}
