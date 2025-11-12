class KickData {
  final Map<String, List<String>> data;

  KickData(this.data);

  factory KickData.fromJson(Map<String, dynamic> json) {
    final Map<String, List<String>> data = {};
    json.forEach((key, value) {
      if (value is List) {
        data[key] = List<String>.from(value);
      }
    });
    return KickData(data);
  }

  Map<String, dynamic> toJson() {
    return data;
  }

  List<String> getDay(String day) {
    return data[day] ?? [];
  }

  List<String> getAllDays() {
    final days = data.keys.toList();
    days.sort((a, b) => b.compareTo(a)); // Sort descending
    return days;
  }
}

class KickSummary {
  final String? start;
  final String? end;
  final String? tenth;
  final int count;

  KickSummary({
    this.start,
    this.end,
    this.tenth,
    required this.count,
  });

  factory KickSummary.fromTimestamps(List<String> timestamps) {
    if (timestamps.isEmpty) {
      return KickSummary(count: 0);
    }
    return KickSummary(
      start: timestamps.first,
      end: timestamps.last,
      tenth: timestamps.length >= 10 ? timestamps[9] : null,
      count: timestamps.length,
    );
  }
}
