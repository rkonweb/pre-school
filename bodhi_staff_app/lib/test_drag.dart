import 'package:flutter/material.dart';

void main() => runApp(MaterialApp(home: TestApp()));

class TestApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Test')),
      drawer: Drawer(
        child: Builder(
          builder: (context) => ListView(
            children: [
              LongPressDraggable<String>(
                data: 'test',
                feedback: Material(child: Text('Dragging', style: TextStyle(fontSize: 24))),
                onDragStarted: () => Navigator.of(context).pop(),
                child: ListTile(title: Text('Drag Me')),
              ),
            ],
          ),
        ),
      ),
      body: DragTarget<String>(
        onAcceptWithDetails: (d) => print('DROP ACCEPTED: ${d.data}'),
        builder: (context, c, r) => Center(child: Text('Drop Here')),
      ),
    );
  }
}
