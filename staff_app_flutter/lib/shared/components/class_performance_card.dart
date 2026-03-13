import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class ClassPerformanceCard extends StatelessWidget {
  const ClassPerformanceCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color.fromRGBO(20, 14, 40, 0.07), width: 1.5),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(20, 14, 40, 0.1),
            blurRadius: 28,
            offset: Offset(0, 8),
          ),
          BoxShadow(
            color: Color.fromRGBO(20, 14, 40, 0.05),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Class 8-A Average',
                    style: TextStyle(
                      fontFamily: 'Satoshi',
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF7B7291),
                    ),
                  ),
                  const SizedBox(height: 3),
                  const Text(
                    '74.2%',
                    style: TextStyle(
                      fontFamily: 'Clash Display',
                      fontSize: 32,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF140E28),
                      letterSpacing: -1.5,
                      height: 1,
                    ),
                  ).animate().shimmer(duration: 1.seconds, color: Colors.grey.shade300),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'vs Last Month',
                    style: TextStyle(
                      fontFamily: 'Satoshi',
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF7B7291),
                    ),
                  ),
                  const SizedBox(height: 3),
                  const Text(
                    '↑ 3.1%',
                    style: TextStyle(
                      fontFamily: 'Satoshi',
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF16A34A),
                      height: 1,
                    ),
                  ),
                  const SizedBox(height: 5),
                  // Sparkline
                  SizedBox(
                    height: 20,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        _SparkBar(height: 0.55, color: const Color(0xFFFF5733)),
                        _SparkBar(height: 0.65, color: const Color(0xFFFF5733)),
                        _SparkBar(height: 0.70, color: const Color(0xFFFF5733)),
                        _SparkBar(height: 0.68, color: const Color(0xFFFF5733)),
                        _SparkBar(height: 0.73, color: const Color(0xFFFF5733)),
                        _SparkBar(height: 0.82, color: const Color(0xFFFF006E)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'TOP PERFORMERS',
            style: TextStyle(
              fontFamily: 'Satoshi',
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: Color(0xFF7B7291),
              letterSpacing: 0.7,
            ),
          ),
          const SizedBox(height: 10),
          _TopPerformerRow(
            rank: '#1',
            name: 'Ananya Krishnan',
            score: '96%',
            gradient: const LinearGradient(colors: [Color(0xFFFFD700), Color(0xFFFFA500)]),
          ),
          const SizedBox(height: 8),
          _TopPerformerRow(
            rank: '#2',
            name: 'Rohan Mehta',
            score: '93%',
            gradient: const LinearGradient(colors: [Color(0xFFC0C0C0), Color(0xFFA0A0A0)]),
          ),
          const SizedBox(height: 8),
          _TopPerformerRow(
            rank: '#3',
            name: 'Sneha Patil',
            score: '91%',
            gradient: const LinearGradient(colors: [Color(0xFFCD7F32), Color(0xFFA05A20)]),
          ),
        ],
      ),
    );
  }
}

class _SparkBar extends StatelessWidget {
  final double height;
  final Color color;

  const _SparkBar({required this.height, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 4,
      height: 20 * height,
      margin: const EdgeInsets.only(left: 3),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(2),
      ),
    ).animate().scaleY(begin: 0, end: 1, duration: 800.ms, curve: Curves.easeOutBack, alignment: Alignment.bottomCenter);
  }
}

class _TopPerformerRow extends StatelessWidget {
  final String rank;
  final String name;
  final String score;
  final LinearGradient gradient;

  const _TopPerformerRow({
    required this.rank,
    required this.name,
    required this.score,
    required this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            gradient: gradient,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(
              rank,
              style: const TextStyle(
                fontFamily: 'Clash Display',
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: -0.5,
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            name,
            style: const TextStyle(
              fontFamily: 'Satoshi',
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: Color(0xFF140E28),
            ),
          ),
        ),
        Text(
          score,
          style: const TextStyle(
            fontFamily: 'Satoshi',
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: Color(0xFF16A34A),
          ),
        ),
      ],
    );
  }
}
