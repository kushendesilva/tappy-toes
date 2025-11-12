import 'package:flutter_test/flutter_test.dart';
import 'package:tappy_toes/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Initialize SharedPreferences with mock values
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    
    // Build our app and trigger a frame
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();

    // Verify that the app starts without crashing
    expect(find.text('Track'), findsOneWidget);
    expect(find.text('History'), findsOneWidget);
  });
}
