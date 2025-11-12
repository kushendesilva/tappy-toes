import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/kick_provider.dart';
import '../utils/date_formatter.dart';
import '../widgets/today_summary.dart';
import 'day_detail_screen.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  void _confirmResetAll(BuildContext context) {
    final provider = context.read<KickProvider>();
    final days = provider.getAllDays();
    
    if (days.isEmpty) return;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset All Data'),
        content: const Text(
          'This will remove every recorded kick. This cannot be undone. Continue?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              provider.resetAll();
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Reset All'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KickProvider>();
    final days = provider.getAllDays();

    return Scaffold(
      appBar: AppBar(
        title: const Text('History'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const TodaySummary(),
            const SizedBox(height: 14),
            GestureDetector(
              onTap: () => _confirmResetAll(context),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: days.isEmpty
                      ? const Color(0xFFc62828).withOpacity(0.4)
                      : const Color(0xFFc62828),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Reset All Data',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Expanded(
              child: days.isEmpty
                  ? const Center(
                      child: Text(
                        'No data yet',
                        style: TextStyle(color: Colors.white70),
                      ),
                    )
                  : ListView.separated(
                      itemCount: days.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final day = days[index];
                        final count = provider.getKicksForDay(day).length;
                        return GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => DayDetailScreen(date: day),
                              ),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              vertical: 14,
                              horizontal: 12,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  formatDate(day),
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.black,
                                  ),
                                ),
                                Text(
                                  '$count',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF4e6af3),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
