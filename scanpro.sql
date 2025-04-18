PGDMP  2                    }            postgres    16.8    17.4 1    A           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            B           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            C           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            D           1262    5    postgres    DATABASE     s   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE postgres;
                     azure_pg_admin    false            E           0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                        azure_pg_admin    false    4164                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                     azure_pg_admin    false            F           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                        azure_pg_admin    false    8            �            1259    24827    Account    TABLE     F  CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);
    DROP TABLE public."Account";
       public         heap r       scanpro    false    8            �            1259    24856    ApiKey    TABLE     L  CREATE TABLE public."ApiKey" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    key text NOT NULL,
    permissions text[],
    "lastUsed" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
    DROP TABLE public."ApiKey";
       public         heap r       scanpro    false    8            �            1259    24872    PasswordResetToken    TABLE     �   CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 (   DROP TABLE public."PasswordResetToken";
       public         heap r       scanpro    false    8            �            1259    24880    PaymentWebhookEvent    TABLE     �  CREATE TABLE public."PaymentWebhookEvent" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "eventType" text NOT NULL,
    "resourceType" text NOT NULL,
    "resourceId" text NOT NULL,
    status text DEFAULT 'processed'::text NOT NULL,
    "rawData" text NOT NULL,
    "processedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 )   DROP TABLE public."PaymentWebhookEvent";
       public         heap r       scanpro    false    8            �            1259    24834    Session    TABLE     �   CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);
    DROP TABLE public."Session";
       public         heap r       scanpro    false    8            �            1259    24841    Subscription    TABLE       CREATE TABLE public."Subscription" (
    id text NOT NULL,
    "userId" text NOT NULL,
    tier text DEFAULT 'free'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "canceledAt" timestamp(3) without time zone,
    "currentPeriodEnd" timestamp(3) without time zone,
    "currentPeriodStart" timestamp(3) without time zone,
    "paypalPlanId" text,
    "paypalSubscriptionId" text
);
 "   DROP TABLE public."Subscription";
       public         heap r       scanpro    false    8            �            1259    24864 
   UsageStats    TABLE     �   CREATE TABLE public."UsageStats" (
    id text NOT NULL,
    "userId" text NOT NULL,
    operation text NOT NULL,
    count integer DEFAULT 0 NOT NULL,
    date timestamp(3) without time zone NOT NULL
);
     DROP TABLE public."UsageStats";
       public         heap r       scanpro    false    8            �            1259    24817    User    TABLE     �  CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    role text DEFAULT 'user'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    "verificationToken" text
);
    DROP TABLE public."User";
       public         heap r       scanpro    false    8            �            1259    24851    VerificationToken    TABLE     �   CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);
 '   DROP TABLE public."VerificationToken";
       public         heap r       scanpro    false    8            7          0    24827    Account 
   TABLE DATA           �   COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
    public               scanpro    false    224   A       ;          0    24856    ApiKey 
   TABLE DATA           n   COPY public."ApiKey" (id, "userId", name, key, permissions, "lastUsed", "expiresAt", "createdAt") FROM stdin;
    public               scanpro    false    228   RH       =          0    24872    PasswordResetToken 
   TABLE DATA           V   COPY public."PasswordResetToken" (id, email, token, expires, "createdAt") FROM stdin;
    public               scanpro    false    230   �H       >          0    24880    PaymentWebhookEvent 
   TABLE DATA           �   COPY public."PaymentWebhookEvent" (id, "eventId", "eventType", "resourceType", "resourceId", status, "rawData", "processedAt", "createdAt") FROM stdin;
    public               scanpro    false    231   xI       8          0    24834    Session 
   TABLE DATA           J   COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
    public               scanpro    false    225   �I       9          0    24841    Subscription 
   TABLE DATA           �   COPY public."Subscription" (id, "userId", tier, status, "createdAt", "updatedAt", "canceledAt", "currentPeriodEnd", "currentPeriodStart", "paypalPlanId", "paypalSubscriptionId") FROM stdin;
    public               scanpro    false    226   �I       <          0    24864 
   UsageStats 
   TABLE DATA           L   COPY public."UsageStats" (id, "userId", operation, count, date) FROM stdin;
    public               scanpro    false    229   J       6          0    24817    User 
   TABLE DATA           �   COPY public."User" (id, name, email, "emailVerified", image, password, role, "createdAt", "updatedAt", "isEmailVerified", "verificationToken") FROM stdin;
    public               scanpro    false    223   �J       :          0    24851    VerificationToken 
   TABLE DATA           I   COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
    public               scanpro    false    227   OL       �           2606    24833    Account Account_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY public."Account" DROP CONSTRAINT "Account_pkey";
       public                 scanpro    false    224            �           2606    24863    ApiKey ApiKey_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_pkey" PRIMARY KEY (id);
 @   ALTER TABLE ONLY public."ApiKey" DROP CONSTRAINT "ApiKey_pkey";
       public                 scanpro    false    228            �           2606    24879 *   PasswordResetToken PasswordResetToken_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);
 X   ALTER TABLE ONLY public."PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_pkey";
       public                 scanpro    false    230            �           2606    24889 ,   PaymentWebhookEvent PaymentWebhookEvent_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public."PaymentWebhookEvent"
    ADD CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY (id);
 Z   ALTER TABLE ONLY public."PaymentWebhookEvent" DROP CONSTRAINT "PaymentWebhookEvent_pkey";
       public                 scanpro    false    231            �           2606    24840    Session Session_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY public."Session" DROP CONSTRAINT "Session_pkey";
       public                 scanpro    false    225            �           2606    24850    Subscription Subscription_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY public."Subscription" DROP CONSTRAINT "Subscription_pkey";
       public                 scanpro    false    226            �           2606    24871    UsageStats UsageStats_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public."UsageStats"
    ADD CONSTRAINT "UsageStats_pkey" PRIMARY KEY (id);
 H   ALTER TABLE ONLY public."UsageStats" DROP CONSTRAINT "UsageStats_pkey";
       public                 scanpro    false    229            �           2606    24826    User User_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."User" DROP CONSTRAINT "User_pkey";
       public                 scanpro    false    223            �           1259    24891 &   Account_provider_providerAccountId_key    INDEX     ~   CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");
 <   DROP INDEX public."Account_provider_providerAccountId_key";
       public                 scanpro    false    224    224            �           1259    24897    ApiKey_key_key    INDEX     K   CREATE UNIQUE INDEX "ApiKey_key_key" ON public."ApiKey" USING btree (key);
 $   DROP INDEX public."ApiKey_key_key";
       public                 scanpro    false    228            �           1259    24899    PasswordResetToken_token_key    INDEX     g   CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON public."PasswordResetToken" USING btree (token);
 2   DROP INDEX public."PasswordResetToken_token_key";
       public                 scanpro    false    230            �           1259    24900    PaymentWebhookEvent_eventId_key    INDEX     o   CREATE UNIQUE INDEX "PaymentWebhookEvent_eventId_key" ON public."PaymentWebhookEvent" USING btree ("eventId");
 5   DROP INDEX public."PaymentWebhookEvent_eventId_key";
       public                 scanpro    false    231            �           1259    24892    Session_sessionToken_key    INDEX     a   CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");
 .   DROP INDEX public."Session_sessionToken_key";
       public                 scanpro    false    225            �           1259    24894 %   Subscription_paypalSubscriptionId_key    INDEX     {   CREATE UNIQUE INDEX "Subscription_paypalSubscriptionId_key" ON public."Subscription" USING btree ("paypalSubscriptionId");
 ;   DROP INDEX public."Subscription_paypalSubscriptionId_key";
       public                 scanpro    false    226            �           1259    24893    Subscription_userId_key    INDEX     _   CREATE UNIQUE INDEX "Subscription_userId_key" ON public."Subscription" USING btree ("userId");
 -   DROP INDEX public."Subscription_userId_key";
       public                 scanpro    false    226            �           1259    24898 $   UsageStats_userId_operation_date_key    INDEX     {   CREATE UNIQUE INDEX "UsageStats_userId_operation_date_key" ON public."UsageStats" USING btree ("userId", operation, date);
 :   DROP INDEX public."UsageStats_userId_operation_date_key";
       public                 scanpro    false    229    229    229            �           1259    24890    User_email_key    INDEX     K   CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);
 $   DROP INDEX public."User_email_key";
       public                 scanpro    false    223            �           1259    24896 &   VerificationToken_identifier_token_key    INDEX     |   CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);
 <   DROP INDEX public."VerificationToken_identifier_token_key";
       public                 scanpro    false    227    227            �           1259    24895    VerificationToken_token_key    INDEX     e   CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);
 1   DROP INDEX public."VerificationToken_token_key";
       public                 scanpro    false    227            �           2606    24901    Account Account_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public."Account" DROP CONSTRAINT "Account_userId_fkey";
       public               scanpro    false    223    224    3977            �           2606    24916    ApiKey ApiKey_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 G   ALTER TABLE ONLY public."ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";
       public               scanpro    false    3977    228    223            �           2606    24906    Session Session_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 I   ALTER TABLE ONLY public."Session" DROP CONSTRAINT "Session_userId_fkey";
       public               scanpro    false    225    3977    223            �           2606    24911 %   Subscription Subscription_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 S   ALTER TABLE ONLY public."Subscription" DROP CONSTRAINT "Subscription_userId_fkey";
       public               scanpro    false    226    3977    223            �           2606    24921 !   UsageStats UsageStats_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."UsageStats"
    ADD CONSTRAINT "UsageStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
 O   ALTER TABLE ONLY public."UsageStats" DROP CONSTRAINT "UsageStats_userId_fkey";
       public               scanpro    false    223    229    3977            7   -  x��ٮ�����y�~�Ș���iCa�A-YLf���<}`��[�HQ"E�"��`k�W�>��k�� hC?�7�8�sW}�?-Y�[�aA��ê�x��d�gV������g�<S��L
%>~�k���C�~���!F�&�Nq�������Yw�ɓ`�J��Ʊ~��P�[v��L�'n��<�W'��		{���q#�s���"zjB[��y����`'˧^0��a��x��2��0�JT����e+�4��,�m�uqZ���%�?�1�6y]<T-�ՠ�3^�v5,��0���:@(��p��@�l���G>]���<�)O������8$�1��h��i�/�.m������|���*�Z!��&!��z���"�R�n5r�9��E`]q�����t
��s��7�c+�6յ�
�"��c�������1�x�LDc��礠|�4�Ʀ4��I�D��p����BB5K�5NE��pS����D���E&�v{z�Y�
=�-,#a�4�:�;�+�F(�F��Ĩ��1�Dp���G����[��ĕ�X�j���e+<�2à���`ji�����I5I�{��<t	&@�}���� s����Hgݠ�zZc�����������zE�Ba�YX'@7x�{�} c�������V019��2������$�\K�EĢJ*+݇�:(=�R'��N{o�տ�T��۰���D(�� ���X�J���%TL+ N�N���KC̡#8�Q���]'��r`�t�U��GNm�uTӣ�"_y�(����ak�g]$֏?���z:�۵*��tD�|B��]3�w�U+��g����[
l���/lnECݚGE��aV��%��I�X��^D�QA:��~�E�Z�����w�Q&����k�M#��=k*b�Y��*�8$9��b?��~��~�h�.?��;e���׌�hez�$l���5J�N�<
uچ�.�g��N
��~��άe��F5�|�oJ������%V/sd#mD7)��y�B�����i1�9��~��Lbmٜ"�d�53�7�(�b�|d,Q�vjk{?K��M��9ql�ĕ�I�ْ����t/�M��mc��mGDC>��|��* 2�u8'�����.x�a�H�L���h'�3MP$
P@���(v���ҚK�i�]$6���	F
㷪!�����w�jL�k觑�M�s;m�5g��U��(m�۟�2^��!��+ܻ��pc]�{�������SD��~��M�
�87w�:�d� �/2y�k~�Ôvt0�����0��W��c���yG��0�:�]�$����?�.&�MG�-#�x�Z2�����UB�1�%�k��B����W��l�r��=,�Gu݄�SIe�֩����玜�1N-ԑ���i	'��z��P�@	[��E�k=�Wn�+2E��ǐa�>�8�8O�<T���l��P�k�R�j��2E�lb���Zy8r����O�a�N�G-�^Kݧ�6˥��%@�e���w4T@��U]w{���]��?�Y:�nҶ_Y�+9��ې�pz�?�W�O�Ǝ�&���b4�ﱩJF�&�yW��ڗ���]����eb	*�m6M�@ZÈֻ;!0m�5:�u�9����כ/Ibt�S�4��U.���H��/�ĉ���|�a���?����d��dN{��hʿR%\6��Hc���X�]�o�a��'~f0ْ�vG�X#_�p�,���)����8�ML~nl��ml	4�&wU�Xw����>���!"Uc��a���_��/SǮ�kfO��{��(���j��߾}�ÿ4O      ;   �   x�E�K�0 �u{
�&�����$��� @Cua�wW��+��u9 @��?J�O^+�pN~me>~��7�&Z�[=vі;�5$�H1Z��'�L0�1�d�F�*E$�L�}��݁��\pd�Ј��/u���u�z�(�^J���.]      =   t   x�U�;� @�V�!|�T.�f�@
��7���xŕ��M��^�џ=�QU���?��>�m�ލC�*(rv��� 6�m-��|LAY�~� ] ��6f���������+#�      >      x������ � �      8      x������ � �      9   Z   x�+NILO��KO2 �\��Â�����b��\K2�y%�EE�ũ���%�e��FF��&��&
FV��VFz�F8�c��W� ��&	      <   �   x���A�0E��)� fڴ ��M)C�C�Ђp{AW&j4�����/][t� ��Q
����i��U���&L4�"�W��	&A�T&����@gt۬\����ct����pHL~2^p�}F�tPu�/���_��z.�MIęz����|o<�9�w� c>      6   u  x����N�0E��Wt�m�qR;�e� I�*!7$&ml�f(�דHH $���}�H2��JlQ3���<��}F|��a��J���J��J�T]
��FZ���G�o�.®I]B!��(�kٛ��"��<>FZ�*�M�W#Au4�'�~r�+qޝƳ��M�b�+�C+x�8���Ə�`}�M&�s�3����L��~@o����yA�g,^:�˵��~�,���}X�a�Od$���W�����.F�2�+�ȵ)�	���H2�$e����)2���0�x(���i� � j�(�Y�^��-�Z}<����:kU/a�F�MxW<�x5��4��th��//͕����VG��؟y��m`����g�g      :      x������ � �     