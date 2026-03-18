import 'package:flutter/material.dart';

class HeroHeaderWidget extends StatelessWidget {
  final Map<String, dynamic>? studentData;
  final String activeStudentId;
  final String parentName;
  final List<dynamic> allStudents;
  final Function(String) onStudentSwitch;

  const HeroHeaderWidget({
    Key? key,
    this.studentData,
    required this.activeStudentId,
    required this.parentName,
    required this.allStudents,
    required this.onStudentSwitch,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final String fullName = studentData?['name'] ?? 'Student Name';
    final List<String> nameParts = fullName.split(' ');
    final String fName = nameParts.length > 0 ? nameParts[0] : 'Student';
    final String lName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';
    final String cName = studentData?['classroom'] ?? studentData?['grade'] ?? '';
    final String initial = fName.isNotEmpty ? fName[0] : 'S';
    final String avatarPath = studentData?['avatar'] ?? '';
    final String fullAvatarUrl = avatarPath.isNotEmpty ? 'http://127.0.0.1:3000$avatarPath' : '';
    
    // Parent Name Extract
    final List<String> parentNameParts = parentName.isNotEmpty ? parentName.split(' ') : ['Parent'];
    final String parentInitial = (parentNameParts.isNotEmpty && parentNameParts[0].isNotEmpty) 
       ? parentNameParts[0][0] 
       : 'P';
    final String parentLastInitial = (parentNameParts.length > 1 && parentNameParts[1].isNotEmpty) 
       ? parentNameParts[1][0] 
       : '';

    return Container(
      height: 235,
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFF0D1117),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(40),
          bottomRight: Radius.circular(40),
        ),
        boxShadow: [
          BoxShadow(color: Color(0x40111126), blurRadius: 40, offset: Offset(0, 16))
        ],
      ),
      child: Stack(
        children: [
          // 1. Decorative BG
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF0D0A1E), Color(0xFF12113A), Color(0xFF1E1B58), Color(0xFF0F0D2A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(40),
                  bottomRight: Radius.circular(40),
                ),
              ),
            ),
          ),
          
          // 2. Orbs
          Positioned(
            top: -40, right: -30,
            child: Container(
              width: 160, height: 160,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [const Color(0xFF6366F1).withOpacity(0.45), Colors.transparent],
                  stops: const [0.0, 0.65],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 10, left: 20,
            child: Container(
              width: 120, height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [const Color(0xFF8B5CF6).withOpacity(0.35), Colors.transparent],
                  stops: const [0.0, 0.65],
                ),
              ),
            ),
          ),
          
          // 3 Vignette
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(40),
                  bottomRight: Radius.circular(40),
                ),
                gradient: LinearGradient(
                  colors: [Color(0x26000000), Colors.transparent, Colors.transparent, Color(0x80000000), Color(0xD1000000)],
                  stops: [0.0, 0.3, 0.45, 0.75, 1.0],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),

          // 4. Content
          SafeArea(
            bottom: false,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 10),
                
                // Top Nav
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '☀️ Good Morning',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Color(0x8CFFFFFF),
                              letterSpacing: 0.3,
                            ),
                          ),
                          RichText(
                            text: TextSpan(
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                letterSpacing: -0.2,
                              ),
                              children: [
                                TextSpan(text: '${parentNameParts[0]} '),
                                if (parentNameParts.length > 1) 
                                   TextSpan(text: parentNameParts.sublist(1).join(' '), style: const TextStyle(color: Color(0xFFA5B4FC))),
                              ]
                            )
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          // Notification Bell
                          Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Container(
                                width: 36, height: 36,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white.withOpacity(0.14),
                                  border: Border.all(color: Colors.white.withOpacity(0.20)),
                                ),
                                child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 20),
                              ),
                              Positioned(
                                top: -3, right: -3,
                                child: Container(
                                  width: 15, height: 15,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF43F5E),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                    boxShadow: const [BoxShadow(color: Color(0x80F43F5E), blurRadius: 6, offset: Offset(0, 2))],
                                  ),
                                  child: const Center(
                                    child: Text('3', style: TextStyle(color: Colors.white, fontSize: 7.5, fontWeight: FontWeight.w900)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 8),
                          // User Profile setting
                          Container(
                            width: 36, height: 36,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFA78BFA)]),
                              border: Border.all(color: Colors.white.withOpacity(0.20)),
                            ),
                            child: Center(
                              child: Text('$parentInitial$parentLastInitial'.toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                const Spacer(),
                
                // Student Data Content
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 46),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      // Avatar
                      Container(
                        width: 72, height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFA78BFA)],
                            begin: Alignment.topLeft, end: Alignment.bottomRight,
                          ),
                          border: Border.all(color: Colors.white.withOpacity(0.9), width: 3),
                          boxShadow: const [
                            BoxShadow(color: Color(0x66000000), blurRadius: 20, offset: Offset(0, 4)),
                            BoxShadow(color: Color(0x80818CF8), blurRadius: 0, spreadRadius: 1)
                          ]
                        ),
                        child: Stack(
                          clipBehavior: Clip.none,
                          children: [
                            if (fullAvatarUrl.isNotEmpty)
                               ClipOval(
                                 child: Image.network(
                                   fullAvatarUrl,
                                   width: 72,
                                   height: 72,
                                   fit: BoxFit.cover,
                                   errorBuilder: (context, error, stackTrace) {
                                     return Center(
                                       child: Text(
                                         initial,
                                         style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5),
                                       ),
                                     );
                                   },
                                 ),
                               )
                            else
                               Center(
                                 child: Text(
                                   initial,
                                   style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5),
                                 ),
                               ),
                            // Green Active Dot
                            Positioned(
                              bottom: 0, right: 0,
                              child: Container(
                                width: 14, height: 14,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: const Color(0xFF22C55E),
                                  border: Border.all(color: Colors.white, width: 2.5),
                                  boxShadow: const [BoxShadow(color: Color(0x8022C55E), blurRadius: 6, offset: Offset(0, 2))]
                                ),
                              ),
                            )
                          ],
                        ),
                      ),
                      
                      const SizedBox(width: 14),
                      
                      // Text Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 6, height: 6,
                                  decoration: const BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: Color(0xFF818CF8),
                                    boxShadow: [BoxShadow(color: Color(0xCC818CF8), blurRadius: 8)]
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '${studentData?['schoolName']?.toString().toUpperCase() ?? 'EDUSPHERE'} · TERM 2, 2024–25',
                                  style: const TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0x9EFFFFFF),
                                    letterSpacing: 1.5,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            RichText(
                              text: TextSpan(
                                style: const TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  height: 1.1,
                                  letterSpacing: -0.6,
                                  shadows: [Shadow(color: Color(0x66000000), blurRadius: 20, offset: Offset(0, 2))]
                                ),
                                children: [
                                  TextSpan(text: '$fName '),
                                  TextSpan(text: lName, style: const TextStyle(color: Color(0xFFA5B4FC))),
                                ]
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              'Class $cName · ${studentData?['schoolName'] ?? 'EduSphere International'}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Color(0x99FFFFFF),
                                letterSpacing: 0.2
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
