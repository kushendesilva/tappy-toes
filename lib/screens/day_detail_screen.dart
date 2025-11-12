import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/kick_provider.dart';
import '../utils/date_formatter.dart';

class DayDetailScreen extends StatelessWidget {
  final String date;

  const DayDetailScreen({super.key, required this.date});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KickProvider>();
    final kicks = provider.getKicksForDay(date);

    return Scaffold(
      appBar: AppBar(
        title: Text(formatDate(date)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              formatDate(date),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${kicks.length} kicks',
              style: const TextStyle(
                fontSize: 14,
                color: Colors.white70,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: kicks.isEmpty
                  ? const Center(
                      child: Text(
                        'No entries',
                        style: TextStyle(color: Colors.white70),
                      ),
                    )
                  : ListView.separated(
                      itemCount: kicks.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final timestamp = kicks[index];
                        return Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 32,
                                child: Text(
                                  '${index + 1}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color: Colors.black,
                                  ),
                                ),
                              ),
                              Text(
                                formatTime(timestamp),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.black,
                                ),
                              ),
                            ],
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
