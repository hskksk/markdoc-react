import cytoscape from 'cytoscape'
import * as echarts from 'echarts'
import vegaEmbed from 'vega-embed'
import {
  MarkdocReader,
  createChartRenderer,
  createCytoscapeGraphHandler,
  createEChartsChartHandler,
  createGraphRenderer,
  createVegaLiteChartHandler,
  mockTreemapAi,
} from '@hskksk/markdoc-react'
import dockerSample from './sample-docker.md?raw'

const chartRenderer = createChartRenderer({
  echarts: createEChartsChartHandler(echarts),
  'vega-lite': createVegaLiteChartHandler(vegaEmbed),
})

const graphRenderer = createGraphRenderer({
  cytoscape: createCytoscapeGraphHandler(cytoscape),
})

const vizAppendix = `

## 参考: チャート埋め込み

Markdoc の chart / graph タグも同じ Reader で並べられます。

### ECharts

{% chart engine="echarts" height="280" %}
\`\`\`json
{
  "xAxis": { "type": "category", "data": ["A", "B", "C"] },
  "yAxis": { "type": "value" },
  "series": [{ "type": "bar", "data": [12, 20, 9] }]
}
\`\`\`
{% /chart %}

### サービス依存

{% graph engine="cytoscape" height="260" %}
\`\`\`json
{
  "elements": [
    { "data": { "id": "a", "label": "API" } },
    { "data": { "id": "b", "label": "DB" } },
    { "data": { "source": "a", "target": "b" } }
  ],
  "layout": { "name": "grid", "animate": false }
}
\`\`\`
{% /graph %}
`

const source = dockerSample + vizAppendix

export function App() {
  return (
    <div className="demo-page">
      <h1>@hskksk/markdoc-react — treemap minimap demo</h1>
      <p className="demo-lede">
        右側は mem の HTML デモと同じタイル型ミニマップ（章番号・SVG リンク・モック AI）。左をスクロールすると対応タイルがハイライトされます。
      </p>
      <MarkdocReader
        source={source}
        chartRenderer={chartRenderer}
        graphRenderer={graphRenderer}
        theme="dark"
        treemap={{ ai: mockTreemapAi, theme: 'dark', mode: 'minimap' }}
      />
    </div>
  )
}
