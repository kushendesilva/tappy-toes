import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/kick_provider.dart';
import '../models/kick_data.dart';
import '../utils/date_formatter.dart';

class TodaySummary extends StatelessWidget {
  const TodaySummary({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KickProvider>();
    final kicks = provider.getTodayKicks();
    final summary = KickSummary.fromTimestamps(kicks);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F6FA),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Today',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 8),
          _SummaryRow(
            label: 'Started',
            value: summary.start != null ? formatTime(summary.start!) : '-',
          ),
          _SummaryRow(
            label: 'Ended',
            value: summary.end != null ? formatTime(summary.end!) : '-',
          ),
          _SummaryRow(
            label: '10th Kick',
            value: summary.tenth != null ? formatTime(summary.tenth!) : '-',
          ),
          _SummaryRow(
            label: 'Count',
            value: '${summary.count}',
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;

  const _SummaryRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '$label:',
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF444444),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
          ),
        ],
      ),
    );
  }
}
