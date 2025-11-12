import 'package:intl/intl.dart';

String formatTime(String iso) {
  try {
    final date = DateTime.parse(iso);
    return DateFormat('HH:mm:ss').format(date);
  } catch (e) {
    return iso;
  }
}

String formatDate(String day) {
  try {
    final parts = day.split('-');
    if (parts.length != 3) return day;
    
    final year = int.parse(parts[0]);
    final month = int.parse(parts[1]);
    final dayNum = int.parse(parts[2]);
    
    final date = DateTime(year, month, dayNum);
    return DateFormat('EEE, MMM d').format(date);
  } catch (e) {
    return day;
  }
}

String formatDisplayDate(DateTime date) {
  final day = date.day;
  final suffix = _getDaySuffix(day);
  final month = DateFormat('MMMM').format(date);
  return '$day$suffix $month';
}

String _getDaySuffix(int day) {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}
