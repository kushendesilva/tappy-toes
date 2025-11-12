import 'package:flutter_test/flutter_test.dart';
import 'package:tappy_toes/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that the app starts without crashing
    expect(find.text('Track'), findsOneWidget);
  });
}
