from flask import Flask, request, jsonify
import networkx as nx

app = Flask(__name__)

def normalize(name):
    return name.strip().lower()

def find_shortest_path(graph_data, source, target, include_tolls=True):
    try:
        graph = nx.DiGraph()
        for edge in graph_data:
            if not include_tolls and edge.get('isToll'):
                continue
            graph.add_edge(
                normalize(edge['from']),
                normalize(edge['to']),
                weight=edge['weight']
            )

        source = normalize(source)
        target = normalize(target)

        if source not in graph:
            return {'error': f"Source '{source}' not in graph. Nodes: {list(graph.nodes)}"}
        if target not in graph:
            return {'error': f"Target '{target}' not in graph. Nodes: {list(graph.nodes)}"}

        shortest_path = nx.shortest_path(graph, source=source, target=target, weight='weight')
        total_distance = sum(graph[u][v]['weight'] for u, v in zip(shortest_path, shortest_path[1:]))

        return {
            'shortest_path': shortest_path,
            'steps': len(shortest_path) - 1,
            'total_distance': total_distance
        }
    except Exception as e:
        return {'error': str(e)}

@app.route('/optimize-route', methods=['POST'])
def optimize_route():
    data = request.json
    graph_data = data.get('graph', [])
    start = data.get('start')
    end = data.get('end')
    include_tolls = data.get('includeTollRoads', True)

    if not graph_data or not start or not end:
        return jsonify({'error': 'Missing data'}), 400

    result = find_shortest_path(graph_data, start, end, include_tolls)
    return jsonify(result)



if __name__ == '__main__':
    app.run(port=5000)
