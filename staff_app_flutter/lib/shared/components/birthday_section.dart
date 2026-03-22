import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/state/auth_state.dart';
import '../../core/config/api_config.dart';

// ─── Model ────────────────────────────────────────────────────────────────────
class BirthdayPerson {
  final String id, name, subtitle;
  final String? photoUrl;
  final int? age;
  final int daysUntil;
  final bool isStaff;

  const BirthdayPerson({
    required this.id,
    required this.name,
    required this.subtitle,
    this.photoUrl,
    this.age,
    required this.daysUntil,
    required this.isStaff,
  });

  factory BirthdayPerson.fromJson(Map<String, dynamic> j) => BirthdayPerson(
        id: j['id'] ?? '',
        name: j['name'] ?? '',
        subtitle: j['subtitle'] ?? '',
        photoUrl: j['photoUrl'],
        age: j['age'],
        daysUntil: j['daysUntil'] ?? 0,
        isStaff: j['type'] == 'staff',
      );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
final birthdayProvider =
    FutureProvider.autoDispose<List<BirthdayPerson>>((ref) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) return [];

  final now = DateTime.now();
  final localDate =
      '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

  try {
    final res = await http.get(
      Uri.parse('$apiBase/api/mobile/v1/staff/birthdays?date=$localDate&days=5'),
      headers: {'Authorization': 'Bearer ${user!.token}'},
    ).timeout(const Duration(seconds: 15));

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['success'] == true) {
        final list = data['birthdays'] as List;
        return list.map((j) => BirthdayPerson.fromJson(j)).toList();
      }
    }
  } catch (e) {
    debugPrint('🎂 Birthday API error: $e');
  }
  return [];
});

// ─── Pre-made wish messages (must match server whitelist exactly) ──────────────
const _wishMessages = [
  (emoji: '🎂', text: 'Wishing you a very Happy Birthday! 🎂 May this special day bring you lots of joy and happiness. From the whole team!'),
  (emoji: '🌟', text: 'Happy Birthday! 🌟 Your dedication and hard work inspire us all every day. Have a wonderful day!'),
  (emoji: '🎉', text: 'Sending warmest birthday wishes your way! 🎉 May this year bring you loads of success and happiness!'),
  (emoji: '🥳', text: 'Happy Birthday! 🥳 Thank you for being such an amazing part of our team. Cheers to you!'),
  (emoji: '🎈', text: 'Many happy returns of the day! 🎈 Wishing you great health, happiness and prosperity!'),
];

// ─── Gradient palettes ────────────────────────────────────────────────────────
const _studentGradients = [
  [Color(0xFFFF6B6B), Color(0xFFFFB347)],
  [Color(0xFF7B2FF7), Color(0xFFFF006E)],
  [Color(0xFFFF5733), Color(0xFFFFC878)],
  [Color(0xFFe8198b), Color(0xFFc81d77)],
  [Color(0xFFf953c6), Color(0xFFb91d73)],
];

const _staffGradients = [
  [Color(0xFF667eea), Color(0xFF764ba2)],
  [Color(0xFF11998e), Color(0xFF38ef7d)],
  [Color(0xFF4776E6), Color(0xFF8E54E9)],
  [Color(0xFF0F2027), Color(0xFF2C5364)],
  [Color(0xFF1a1a2e), Color(0xFF16213e)],
];

// ─── Day label helper ─────────────────────────────────────────────────────────
String _dayLabel(int daysUntil) {
  switch (daysUntil) {
    case 0: return '🎉 Today';
    case 1: return 'Tomorrow';
    case 2: return 'In 2 days';
    default: return 'In $daysUntil days';
  }
}

Color _badgeBg(int daysUntil) {
  if (daysUntil == 0) return const Color(0xFFFF5733);
  if (daysUntil == 1) return Colors.white.withOpacity(0.28);
  return Colors.white.withOpacity(0.18);
}

// ─── Main Section Widget ──────────────────────────────────────────────────────
class BirthdaySection extends ConsumerStatefulWidget {
  const BirthdaySection({super.key});

  @override
  ConsumerState<BirthdaySection> createState() => _BirthdaySectionState();
}

class _BirthdaySectionState extends ConsumerState<BirthdaySection> {
  late final PageController _pc;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pc = PageController();
    _pc.addListener(_onPageChange);
  }

  void _onPageChange() {
    final page = _pc.page?.round() ?? 0;
    if (page != _currentPage) setState(() => _currentPage = page);
  }

  @override
  void dispose() {
    _pc.removeListener(_onPageChange);
    _pc.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(birthdayProvider);
    final token = ref.read(userProfileProvider)?.token;

    return async.when(
      loading: () => const SizedBox(
        height: 196,
        child: Center(
          child: CircularProgressIndicator(
              color: Color(0xFFFF5733), strokeWidth: 2),
        ),
      ),
      error: (_, __) => const SizedBox.shrink(),
      data: (people) {
        if (people.isEmpty) return const SizedBox.shrink();

        final pages = <List<BirthdayPerson>>[];
        for (int i = 0; i < people.length; i += 2) {
          pages.add(people.sublist(i, min(i + 2, people.length)));
        }

        final hasToday = people.any((p) => p.daysUntil == 0);
        final title = hasToday ? "Today's Birthdays" : "Upcoming Birthdays";

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────────────────
            Row(
              children: [
                const Text('🎂', style: TextStyle(fontSize: 18)),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontFamily: 'Cabinet Grotesk',
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF140E28),
                    letterSpacing: -0.3,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // ── Carousel ─────────────────────────────────────────────────────
            SizedBox(
              height: 240,
              child: PageView.builder(
                controller: _pc,
                clipBehavior: Clip.hardEdge,
                itemCount: pages.length,
                itemBuilder: (_, idx) {
                  final pair = pages[idx];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Row(
                      children: [
                        Expanded(
                          child: _BirthdayCard(
                            person: pair[0],
                            token: token,
                            gradients: pair[0].isStaff
                                ? _staffGradients[pair[0].id.hashCode % _staffGradients.length]
                                : _studentGradients[pair[0].id.hashCode % _studentGradients.length],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: pair.length > 1
                              ? _BirthdayCard(
                                  person: pair[1],
                                  token: token,
                                  gradients: pair[1].isStaff
                                      ? _staffGradients[pair[1].id.hashCode % _staffGradients.length]
                                      : _studentGradients[pair[1].id.hashCode % _studentGradients.length],
                                )
                              : const SizedBox.shrink(),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // ── Dot indicators ───────────────────────────────────────────────
            if (pages.length > 1) ...[
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  pages.length,
                  (i) => AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: i == _currentPage ? 18 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(3),
                      color: i == _currentPage
                          ? const Color(0xFFFF5733)
                          : const Color(0xFFCDD3E2),
                    ),
                  ),
                ),
              ),
            ],
          ],
        );
      },
    );
  }
}

// ─── Birthday Card ────────────────────────────────────────────────────────────
class _BirthdayCard extends StatefulWidget {
  final BirthdayPerson person;
  final List<Color> gradients;
  final String? token;

  const _BirthdayCard({
    required this.person,
    required this.gradients,
    this.token,
  });

  @override
  State<_BirthdayCard> createState() => _BirthdayCardState();
}

class _BirthdayCardState extends State<_BirthdayCard> {
  bool _wishSent = false;

  // SharedPreferences key: one entry per calendar day, resets automatically tomorrow
  static String _prefsKey() {
    final now = DateTime.now();
    return 'birthday_wishes_${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  @override
  void initState() {
    super.initState();
    if (widget.person.isStaff) _loadSentState();
  }

  Future<void> _loadSentState() async {
    if (!widget.person.isStaff) return;
    final prefs = await SharedPreferences.getInstance();
    final alreadySent = prefs.getStringList(_prefsKey()) ?? [];
    if (alreadySent.contains(widget.person.id) && mounted) {
      setState(() => _wishSent = true);
    }
  }

  Future<void> _markSentInPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final key = _prefsKey();
    final alreadySent = List<String>.from(prefs.getStringList(key) ?? []);
    if (!alreadySent.contains(widget.person.id)) {
      alreadySent.add(widget.person.id);
      await prefs.setStringList(key, alreadySent);
    }
  }

  String get _initials {
    final parts = widget.person.name.trim().split(' ').where((w) => w.isNotEmpty);
    if (parts.isEmpty) return '?';
    return parts.length == 1
        ? parts.first[0].toUpperCase()
        : '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  Future<void> _sendWish(String message) async {
    if (widget.token == null) return;

    try {
      final res = await http.post(
        Uri.parse('$apiBase/api/mobile/v1/staff/birthday-wish'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'recipientId': widget.person.id, 'message': message}),
      ).timeout(const Duration(seconds: 10));

      // 200 = sent successfully
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true) {
          await _markSentInPrefs(); // persist across restarts
          if (mounted) setState(() => _wishSent = true);
          return;
        }
      }

      // 409 = server already has a wish from us today (e.g. after reinstall)
      // Sync client state to match server truth — silently mark as sent
      if (res.statusCode == 409) {
        await _markSentInPrefs();
        if (mounted) setState(() => _wishSent = true);
        return;
      }
    } catch (e) {
      debugPrint('🎁 Wish send error: $e');
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not send wish. Try again.'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  void _showWishSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _WishBottomSheet(
        personName: widget.person.name,
        onSelected: (msg) async {
          Navigator.pop(context);
          await _sendWish(msg);
          if (_wishSent && context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: const Color(0xFF11998e),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                behavior: SnackBarBehavior.floating,
                content: Row(
                  children: [
                    const Text('🎁', style: TextStyle(fontSize: 18)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Birthday wish sent to ${widget.person.name}!',
                        style: const TextStyle(
                          fontFamily: 'Satoshi',
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                duration: const Duration(seconds: 3),
              ),
            );
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: Container(
        width: double.infinity,
        height: 240,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: widget.gradients,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Stack(
          children: [
            ..._buildDots(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Day badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: _badgeBg(widget.person.daysUntil),
                      borderRadius: BorderRadius.circular(20),
                      border: widget.person.daysUntil == 0
                          ? null
                          : Border.all(color: Colors.white.withOpacity(0.4), width: 1),
                    ),
                    child: Text(
                      _dayLabel(widget.person.daysUntil),
                      style: const TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 9.5,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Spacer(),

                  // Photo circle
                  Center(
                    child: Container(
                      width: 84,
                      height: 84,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withOpacity(0.2),
                        border: Border.all(color: Colors.white, width: 3),
                      ),
                      child: ClipOval(
                        child: widget.person.photoUrl != null &&
                                widget.person.photoUrl!.isNotEmpty
                            ? Image.network(
                                widget.person.photoUrl!.startsWith('/')
                                    ? '$apiBase${widget.person.photoUrl}'
                                    : widget.person.photoUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _initialsWidget(),
                              )
                            : _initialsWidget(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Name
                  Center(
                    child: Text(
                      widget.person.name,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 1),

                  // Subtitle
                  Center(
                    child: Text(
                      widget.person.subtitle,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: 'Satoshi',
                        fontSize: 9.5,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withOpacity(0.85),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Bottom pill: "Send Wish" for staff, "Happy Birthday" for students
                  Center(
                    child: widget.person.isStaff
                        ? _wishSent
                            ? _SentBadge()
                            : _WishButton(onTap: _showWishSheet)
                        : _HappyBirthdayPill(isStaff: false),
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _initialsWidget() => Container(
        color: Colors.white.withOpacity(0.15),
        child: Center(
          child: Text(
            _initials,
            style: const TextStyle(
              fontFamily: 'Cabinet Grotesk',
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
        ),
      );

  List<Widget> _buildDots() {
    final rng = Random(widget.person.id.hashCode);
    return List.generate(6, (i) {
      final size = rng.nextDouble() * 5 + 3;
      final left = rng.nextDouble() * 110;
      final top = rng.nextDouble() * 170;
      return Positioned(
        left: left,
        top: top,
        child: Opacity(
          opacity: rng.nextDouble() * 0.3 + 0.1,
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: i.isEven ? BoxShape.circle : BoxShape.rectangle,
              borderRadius: i.isOdd ? BorderRadius.circular(2) : null,
            ),
          ),
        ),
      );
    });
  }
}

// ─── Small sub-widgets ────────────────────────────────────────────────────────
class _WishButton extends StatelessWidget {
  final VoidCallback onTap;
  const _WishButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.22),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.6), width: 1),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('🎁', style: TextStyle(fontSize: 10)),
            SizedBox(width: 4),
            Text(
              'Send Wish',
              style: TextStyle(
                fontFamily: 'Satoshi',
                fontSize: 9,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SentBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.25),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.check_circle, color: Colors.white, size: 11),
          SizedBox(width: 4),
          Text(
            'Wish Sent!',
            style: TextStyle(
              fontFamily: 'Satoshi',
              fontSize: 9,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _HappyBirthdayPill extends StatelessWidget {
  final bool isStaff;
  const _HappyBirthdayPill({required this.isStaff});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.18),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.35), width: 1),
      ),
      child: Text(
        isStaff ? '🌟 Happy Birthday!' : '🎉 Happy Birthday!',
        style: const TextStyle(
          fontFamily: 'Satoshi',
          fontSize: 8.5,
          fontWeight: FontWeight.w800,
          color: Colors.white,
        ),
      ),
    );
  }
}

// ─── Wish Bottom Sheet ────────────────────────────────────────────────────────
class _WishBottomSheet extends StatelessWidget {
  final String personName;
  final void Function(String message) onSelected;

  const _WishBottomSheet({
    required this.personName,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).viewInsets.bottom;
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.80,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF1A1A2E),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(20, 14, 20, 24 + bottomPadding),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Header
            Row(
              children: [
                const Text('🎂', style: TextStyle(fontSize: 22)),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Send a Birthday Wish',
                        style: TextStyle(
                          fontFamily: 'Cabinet Grotesk',
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Tap a message to wish ${personName.split(' ').first}',
                        style: TextStyle(
                          fontFamily: 'Satoshi',
                          fontSize: 13,
                          color: Colors.white.withOpacity(0.55),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Message tiles
            ...List.generate(_wishMessages.length, (i) {
              final msg = _wishMessages[i];
              return _WishMessageTile(
                emoji: msg.emoji,
                text: msg.text,
                onTap: () => onSelected(msg.text),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class _WishMessageTile extends StatefulWidget {
  final String emoji, text;
  final VoidCallback onTap;

  const _WishMessageTile({
    required this.emoji,
    required this.text,
    required this.onTap,
  });

  @override
  State<_WishMessageTile> createState() => _WishMessageTileState();
}

class _WishMessageTileState extends State<_WishMessageTile> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: _pressed
              ? Colors.white.withOpacity(0.15)
              : Colors.white.withOpacity(0.07),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: _pressed
                ? Colors.white.withOpacity(0.4)
                : Colors.white.withOpacity(0.12),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Text(widget.emoji, style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                widget.text,
                style: TextStyle(
                  fontFamily: 'Satoshi',
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withOpacity(0.9),
                  height: 1.4,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Icon(
              Icons.send_rounded,
              color: Colors.white.withOpacity(0.35),
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}
