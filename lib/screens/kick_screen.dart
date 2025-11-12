import 'package:flutter/material.dart';
import 'package:flutter_vibrate/flutter_vibrate.dart';
import 'package:provider/provider.dart';
import '../providers/kick_provider.dart';
import '../utils/date_formatter.dart';

class KickScreen extends StatefulWidget {
  const KickScreen({super.key});

  @override
  State<KickScreen> createState() => _KickScreenState();
}

class _KickScreenState extends State<KickScreen> with SingleTickerProviderStateMixin {
  static const int milestone = 10;
  bool _celebrate = false;
  bool _triggered = false;
  late AnimationController _scaleController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.94).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _scaleController.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    _scaleController.forward();
    Vibrate.feedback(FeedbackType.light);
  }

  void _onTapUp(TapUpDetails details) {
    _scaleController.reverse();
  }

  void _onTapCancel() {
    _scaleController.reverse();
  }

  Future<void> _onTap() async {
    final provider = context.read<KickProvider>();
    final kicksBefore = provider.getTodayKicks().length;
    
    await provider.recordKick();
    
    final kicksAfter = provider.getTodayKicks().length;
    
    if (kicksAfter == milestone) {
      Vibrate.feedback(FeedbackType.success);
    } else {
      Vibrate.feedback(FeedbackType.medium);
    }
  }

  void _handleUndo() {
    final provider = context.read<KickProvider>();
    if (provider.getTodayKicks().isEmpty) return;
    
    provider.undoLastKick();
    Vibrate.feedback(FeedbackType.heavy);
  }

  void _handleLongPressUndo() {
    final provider = context.read<KickProvider>();
    if (provider.getTodayKicks().isEmpty) return;
    
    Vibrate.feedback(FeedbackType.warning);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset Today'),
        content: const Text('Remove all kicks recorded today?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              provider.resetToday();
              Vibrate.feedback(FeedbackType.error);
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Reset'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<KickProvider>();
    final kicks = provider.getTodayKicks();
    final displayDate = formatDisplayDate(DateTime.now());
    
    // Check for celebration
    if (kicks.length == milestone && !_triggered) {
      _triggered = true;
      _celebrate = true;
      Future.delayed(const Duration(milliseconds: 3500), () {
        if (mounted) {
          setState(() {
            _celebrate = false;
          });
        }
      });
    }
    if (kicks.length < milestone) {
      _triggered = false;
    }

    final size = MediaQuery.of(context).size.width * 0.75;
    final maxSize = 270.0;
    final buttonSize = size > maxSize ? maxSize : size;

    return Scaffold(
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Positioned(
                  child: Column(
                    children: [
                      const SizedBox(height: 60),
                      Text(
                        displayDate,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${kicks.length}',
                        style: const TextStyle(
                          fontSize: 54,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                GestureDetector(
                  onTapDown: _onTapDown,
                  onTapUp: _onTapUp,
                  onTapCancel: _onTapCancel,
                  onTap: _onTap,
                  child: ScaleTransition(
                    scale: _scaleAnimation,
                    child: Container(
                      width: buttonSize,
                      height: buttonSize,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFF4e6af3),
                      ),
                      child: Center(
                        child: Image.asset(
                          'assets/icons/kick.png',
                          width: buttonSize * 0.45,
                          height: buttonSize * 0.45,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
                const Spacer(),
              ],
            ),
          ),
          Positioned(
            left: 24,
            right: 24,
            bottom: 40,
            child: GestureDetector(
              onTap: _handleUndo,
              onLongPress: _handleLongPressUndo,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFF222222),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  'Undo',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
          ),
          if (_celebrate)
            Positioned.fill(
              child: IgnorePointer(
                child: Container(
                  color: Colors.transparent,
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 28,
                        vertical: 24,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.75),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Congrats!',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          SizedBox(height: 6),
                          Text(
                            '10 kicks recorded',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
